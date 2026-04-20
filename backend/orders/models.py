from django.db import models
from users.models import User
from products.models import Product
from shipping.models import ShippingAddress


class Order(models.Model):

    PAYMENT_CHOICES = (
        ('online', 'Online Payment'),
        ('cod', 'Cash on Delivery'),
    )

    STATUS_CHOICES = (
        ('payment_pending', 'Payment Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('payment_failed', 'Payment Failed'),  # 🔥 IMPORTANT
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    shipping_address = models.ForeignKey(
        ShippingAddress,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        default='cod'
    )

    # 🔥 FIX: correct default
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='payment_pending'
    )

    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.email} - {self.status}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"