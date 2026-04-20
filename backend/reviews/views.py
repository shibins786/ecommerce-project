from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from django.shortcuts import get_object_or_404

from .models import Review
from .serializers import ReviewSerializer
from products.models import Product


# =========================
# Add or update review
# =========================
class AddUpdateReview(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get('product')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not product_id:
            return Response(
                {"error": "Product ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(Product, id=product_id)

        try:
            rating = int(rating)
        except:
            return Response(
                {"error": "Rating must be a number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if rating < 1 or rating > 5:
            return Response(
                {"error": "Rating must be between 1 and 5"},
                status=status.HTTP_400_BAD_REQUEST
            )

        review, created = Review.objects.update_or_create(
            user=user,
            product=product,
            defaults={'rating': rating, 'comment': comment}
        )

        serializer = ReviewSerializer(review)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# =========================
# Get all reviews + avg rating
# =========================
class ProductReviews(APIView):

    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)

        reviews = product.reviews.all()

        # ✅ FIXED (safe handling for NULL)
        avg_rating = reviews.aggregate(Avg('rating')).get('rating__avg') or 0

        serializer = ReviewSerializer(reviews, many=True)

        return Response({
            'average_rating': avg_rating,
            'reviews': serializer.data
        }, status=status.HTTP_200_OK)


# =========================
# Delete review
# =========================
class DeleteReview(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        user = request.user

        review = get_object_or_404(
            Review,
            user=user,
            product_id=product_id
        )

        review.delete()

        return Response(
            {"detail": "Review deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )