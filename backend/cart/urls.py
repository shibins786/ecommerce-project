from django.urls import path
from .views import AddToCart, ViewCart, RemoveFromCart

urlpatterns = [
    path('', ViewCart.as_view()),                 # GET → view cart
    path('add/', AddToCart.as_view()),            # POST → add to cart
    path('remove/<int:pk>/', RemoveFromCart.as_view()),  # DELETE → remove item
]

