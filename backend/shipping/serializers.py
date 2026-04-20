from rest_framework import serializers
from .models import ShippingAddress, DeliveryStatus


# =========================================
# SHIPPING ADDRESS SERIALIZER
# =========================================
class ShippingAddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = ShippingAddress
        fields = [
            "id",
            "user",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "created_at"
        ]
        read_only_fields = ["id", "user", "created_at"]


# =========================================
# DELIVERY STATUS SERIALIZER (FIXED)
# =========================================
class DeliveryStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeliveryStatus
        fields = [
            "id",
            "order",
            "status",
            "reason",       # 🔥 NEW (IMPORTANT)
            "created_at"    # 🔥 replaced updated_at
        ]
        read_only_fields = ["id", "created_at"]