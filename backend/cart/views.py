from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product

from django.db.models import F
from django.db import transaction


# =========================
# ADD TO CART (FIXED)
# =========================
class AddToCart(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        product_id = request.data.get('product') or request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        # ❌ VALIDATIONS
        if not product_id:
            return Response(
                {"error": True, "message": "Product required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.select_for_update().get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": True, "message": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity <= 0:
            return Response(
                {"error": True, "message": "Invalid quantity"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > product.stock:
            return Response(
                {"error": True, "message": "Not enough stock"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ GET OR CREATE CART
        cart, _ = Cart.objects.get_or_create(user=user)

        # ✅ GET OR CREATE ITEM
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": 0}
        )

        # ✅ SAFE INCREMENT
        cart_item.quantity = F("quantity") + quantity
        cart_item.save()

        # ✅ GET ACTUAL VALUE
        cart_item.refresh_from_db()

        # ✅ RETURN FULL STRUCTURE (IMPORTANT FIX)
        return Response({
            "id": cart_item.id,
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image": request.build_absolute_uri(product.image.url) if product.image else None,
            },
            "quantity": cart_item.quantity
        }, status=status.HTTP_200_OK)


# =========================
# VIEW CART
# =========================
class ViewCart(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        serializer = CartSerializer(cart, context={'request': request})

        return Response(serializer.data, status=status.HTTP_200_OK)


# =========================
# REMOVE FROM CART
# =========================
class RemoveFromCart(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            cart = Cart.objects.get(user=request.user)
            item = CartItem.objects.get(id=pk, cart=cart)

            item.delete()

            return Response(
                {"error": False, "message": "Item removed successfully"},
                status=status.HTTP_200_OK
            )

        except CartItem.DoesNotExist:
            return Response(
                {"error": True, "message": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )