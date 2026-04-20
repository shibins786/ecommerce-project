from django.urls import path
from .views import ShippingAddressView, DeliveryStatusView, UpdateDeliveryStatus

urlpatterns = [
    path('', ShippingAddressView.as_view(),name='shipping-list-create'),                      # GET, POST → address
    path('status/<int:order_id>/', DeliveryStatusView.as_view(),name='delivery-status'), # GET → delivery status
    path('update/<int:order_id>/', UpdateDeliveryStatus.as_view(),name='update-delivery-status') # PUT → admin update
]
