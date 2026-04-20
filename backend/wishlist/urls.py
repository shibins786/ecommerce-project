from django.urls import path
from .views import ToggleWishlistItem, ViewWishlist, RemoveWishlistItem

urlpatterns = [
    path('', ViewWishlist.as_view()),                  # GET → view wishlist
    path('toggle/', ToggleWishlistItem.as_view()),     # POST → toggle add/remove product
    path('remove/<int:pk>/', RemoveWishlistItem.as_view()), # DELETE → remove product
]