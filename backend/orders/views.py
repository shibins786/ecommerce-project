from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction

from shipping.models import ShippingAddress, DeliveryStatus
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import CartItem
from products.models import Product


# =========================================
# CREATE ORDER (COD ONLY + ONLINE PREP)
# =========================================
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction

from shipping.models import ShippingAddress, DeliveryStatus
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import CartItem
from products.models import Product


class CreateOrder(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        payment_method = request.data.get("payment_method", "cod")
        items = request.data.get("items", [])
        shipping_data = request.data.get("shipping")

        # ================= VALIDATION =================
        if payment_method not in ["cod", "online"]:
            return Response({"error": True, "message": "Invalid payment method"}, status=400)

        if not isinstance(items, list) or len(items) == 0:
            return Response({"error": True, "message": "Invalid items"}, status=400)

        if not shipping_data:
            return Response({"error": True, "message": "Shipping address missing"}, status=400)

        # ================= CREATE SHIPPING =================
        shipping_address = ShippingAddress.objects.create(
            user=user,
            address=shipping_data.get("address"),
            city=shipping_data.get("city"),
            state=shipping_data.get("state"),
            pincode=shipping_data.get("pincode"),
            phone=shipping_data.get("phone"),
        )

        validated_items = []
        total_price = 0

        # ================= VALIDATE PRODUCTS =================
        for item in items:
            product = Product.objects.select_for_update().filter(id=item.get("product")).first()

            if not product:
                return Response({"error": True, "message": "Product not found"}, status=404)

            qty = int(item.get("quantity", 1))

            if qty <= 0:
                return Response({"error": True, "message": "Invalid quantity"}, status=400)

            if qty > product.stock:
                return Response({
                    "error": True,
                    "message": f"Not enough stock for {product.name}"
                }, status=400)

            validated_items.append((product, qty))
            total_price += product.price * qty

        # ================= COD =================
        if payment_method == "cod":
            order = Order.objects.create(
                user=user,
                shipping_address=shipping_address,
                total_price=total_price,
                payment_method="cod",
                status="processing",
                is_paid=False
            )

            for product, qty in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=product.price
                )

                product.stock -= qty
                product.save()

            CartItem.objects.filter(cart__user=user).delete()

            DeliveryStatus.objects.create(
                order=order,
                status="processing",
                reason="Order placed (COD)"
            )

            return Response({
                "error": False,
                "order": OrderSerializer(order).data
            })

        # ================= ONLINE =================
        return Response({
            "error": False,
            "message": "Proceed to payment",
            "amount": total_price
        })


# =========================================
# CREATE ORDER AFTER PAYMENT SUCCESS
# =========================================
class CreateOrderAfterPayment(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        items = request.data.get("items", [])

        if not items:
            return Response({"error": True, "message": "Items missing"}, status=400)

        shipping_address = (
            ShippingAddress.objects
            .filter(user=user)
            .order_by("-id")
            .first()
        )

        if not shipping_address:
            return Response({"error": True, "message": "Shipping address missing"}, status=400)

        validated_items = []
        total_price = 0

        for item in items:
            product = Product.objects.select_for_update().get(id=item.get("product"))
            qty = int(item.get("quantity", 1))

            if qty > product.stock:
                return Response({"error": True, "message": "Stock changed"}, status=400)

            validated_items.append((product, qty))
            total_price += product.price * qty

        order = Order.objects.create(
            user=user,
            shipping_address=shipping_address,
            total_price=total_price,
            payment_method="online",
            status="processing",
            is_paid=True
        )

        for product, qty in validated_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price=product.price
            )

            product.stock -= qty
            product.save()

        # CLEAR CART
        CartItem.objects.filter(cart__user=user).delete()

        # DELIVERY STATUS
        DeliveryStatus.objects.create(
            order=order,
            status="processing",
            reason="Payment successful"
        )

        return Response({
            "error": False,
            "order": OrderSerializer(order).data
        })


# =========================================
# USER ORDERS
# =========================================
class UserOrders(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-id")

        data = OrderSerializer(orders, many=True).data

        for order_data in data:
            delivery = (
                DeliveryStatus.objects
                .filter(order_id=order_data["id"])
                .order_by("-created_at")
                .first()
            )

            order_data["delivery_status"] = delivery.status if delivery else "processing"

        return Response({
            "error": False,
            "orders": data
        })


# =========================================
# CANCEL ORDER
# =========================================
class CancelOrder(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, id=pk, user=request.user)

        if order.status in ["shipped", "out_for_delivery", "delivered"]:
            return Response({
                "error": True,
                "message": "Cannot cancel"
            }, status=400)

        order.status = "cancelled"
        order.save()

        DeliveryStatus.objects.create(
            order=order,
            status="cancelled",
            reason="User cancelled order"
        )

        message = "Order cancelled successfully"

        if order.payment_method == "online" and order.is_paid:
            message = "Refund will be processed within 24 hours"

        return Response({
            "error": False,
            "message": message
        })


# =========================================
# DELETE ORDER
# =========================================
class DeleteOrder(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        order = get_object_or_404(Order, id=pk, user=request.user)

        if order.status not in ["cancelled"]:
            return Response({
                "error": True,
                "message": "Only cancelled orders can be deleted"
            }, status=400)

        order.delete()

        return Response({
            "error": False,
            "message": "Deleted"
        })


# =========================================
# ADMIN STATUS UPDATE
# =========================================
class UpdateOrderStatus(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        order = get_object_or_404(Order, id=pk)

        status_value = request.data.get("status")

        valid_status = dict(Order.STATUS_CHOICES).keys()

        if status_value not in valid_status:
            return Response({
                "error": True,
                "message": "Invalid status"
            }, status=400)

        order.status = status_value
        order.save()

        DeliveryStatus.objects.create(
            order=order,
            status=status_value,
            reason="Admin update"
        )

        return Response({
            "error": False,
            "message": "Order status updated"
        })