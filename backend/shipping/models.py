from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


# =========================================
# SHIPPING ADDRESS
# =========================================
class ShippingAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.city}"


# =========================================
# DELIVERY STATUS (FIXED ARCHITECTURE)
# =========================================
class DeliveryStatus(models.Model):

    STATUS_CHOICES = (
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("out_for_delivery", "Out for Delivery"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),   # 🔥 NEW
        ("failed", "Failed"),         # 🔥 NEW (payment failed)
    )

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="delivery_updates"  # 🔥 IMPORTANT
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="processing"
    )

    # 🔥 CRITICAL: store WHY status changed
    reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order.id} - {self.status}"