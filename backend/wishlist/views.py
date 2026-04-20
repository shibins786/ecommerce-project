from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from products.models import Product

# Toggle add/remove product
class ToggleWishlistItem(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product')

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        wishlist, _ = Wishlist.objects.get_or_create(user=user)
        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

        if not created:
            item.delete()
            return Response({"message": "Product removed from wishlist"}, status=status.HTTP_200_OK)

        return Response({"message": "Product added to wishlist"}, status=status.HTTP_201_CREATED)

# View wishlist
class ViewWishlist(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist, context={"request":request})
        return Response(serializer.data)

# Remove single item (optional)
class RemoveWishlistItem(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        try:
            item = WishlistItem.objects.get(id=pk, wishlist=wishlist)
            item.delete()
            return Response({"message": "Removed from wishlist"}, status=status.HTTP_204_NO_CONTENT)
        except WishlistItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)