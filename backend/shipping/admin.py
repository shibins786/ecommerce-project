from django.contrib import admin
from .models import DeliveryStatus,ShippingAddress

admin.site.register(DeliveryStatus)
admin.site.register(ShippingAddress)