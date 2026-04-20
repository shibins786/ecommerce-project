import razorpay
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from orders.models import Order, OrderItem
from products.models import Product
from cart.models import CartItem
from shipping.models import ShippingAddress, DeliveryStatus


# =========================================
# CREATE RAZORPAY ORDER (NO DB ORDER)
# =========================================
class CreateRazorpayOrder(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get("items", [])

        if not items or not isinstance(items, list):
            return Response({
                "error": True,
                "message": "Invalid items"
            }, status=400)

        total_price = 0

        # 🔥 CALCULATE TOTAL FROM PRODUCTS
        for item in items:
            product = Product.objects.filter(id=item.get("product")).first()

            if not product:
                return Response({"error": True, "message": "Product not found"}, status=404)

            qty = int(item.get("quantity", 1))

            if qty > product.stock:
                return Response({
                    "error": True,
                    "message": f"Not enough stock for {product.name}"
                }, status=400)

            total_price += product.price * qty

        amount = int(float(total_price) * 100)

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        razorpay_order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "key": settings.RAZORPAY_KEY_ID,
            "razorpay_order_id": razorpay_order["id"],
            "amount_paise": amount
        })


# =========================================
# VERIFY PAYMENT (CREATE ORDER HERE)
# =========================================
class VerifyPayment(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        data = request.data
        user = request.user

        items = data.get("items", [])
        shipping_data = data.get("shipping", {})

        if not items:
            return Response({"error": True, "message": "Items missing"}, status=400)

        # =============================
        # VERIFY SIGNATURE
        # =============================
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": data["razorpay_order_id"],
                "razorpay_payment_id": data["razorpay_payment_id"],
                "razorpay_signature": data["razorpay_signature"],
            })
        except Exception:
            return Response({
                "error": True,
                "message": "Payment verification failed"
            }, status=400)

        # =============================
        # CREATE SHIPPING
        # =============================
        shipping = ShippingAddress.objects.create(
            user=user,
            address=shipping_data.get("address"),
            city=shipping_data.get("city"),
            state=shipping_data.get("state"),
            pincode=shipping_data.get("pincode"),
            phone=shipping_data.get("phone"),
        )

        total_price = 0
        validated_items = []

        # =============================
        # VALIDATE + LOCK PRODUCTS
        # =============================
        for item in items:
            product = Product.objects.select_for_update().filter(id=item.get("product")).first()

            if not product:
                return Response({"error": True, "message": "Product not found"}, status=404)

            qty = int(item.get("quantity", 1))

            if qty > product.stock:
                return Response({
                    "error": True,
                    "message": f"Stock issue for {product.name}"
                }, status=400)

            validated_items.append((product, qty))
            total_price += product.price * qty

        # =============================
        # CREATE ORDER (NOW ONLY)
        # =============================
        order = Order.objects.create(
            user=user,
            shipping_address=shipping,
            total_price=total_price,
            payment_method="online",
            status="processing",
            is_paid=True,
            paid_at=timezone.now(),
            razorpay_payment_id=data["razorpay_payment_id"],
            razorpay_signature=data["razorpay_signature"]
        )

        # =============================
        # CREATE ITEMS + REDUCE STOCK
        # =============================
        for product, qty in validated_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price=product.price
            )

            product.stock -= qty
            product.save()

        # =============================
        # CLEAR CART
        # =============================
        CartItem.objects.filter(cart__user=user).delete()

        # =============================
        # DELIVERY STATUS
        # =============================
        DeliveryStatus.objects.create(
            order=order,
            status="processing",
            reason="Payment successful"
        )

        return Response({
            "success": True,
            "message": "Payment verified & order created"
        })


# =========================================
# REMOVE THIS (NO LONGER NEEDED)
# =========================================
# ❌ DELETE PaymentFailed class completely