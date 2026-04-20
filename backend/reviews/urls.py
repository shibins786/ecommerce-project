from django.urls import path
from .views import AddUpdateReview, ProductReviews, DeleteReview

urlpatterns = [
    path('add/', AddUpdateReview.as_view()),                         # POST → add/update review
    path('product/<int:product_id>/', ProductReviews.as_view()),     # GET → fetch all reviews + avg rating
    path('product/<int:product_id>/delete/', DeleteReview.as_view()),# DELETE → remove review
]