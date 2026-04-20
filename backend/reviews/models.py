from django.db import models
from django.conf import settings
from products.models import Product

User = settings.AUTH_USER_MODEL

class Review(models.Model):
    RATING_CHOICES = [
        (1,'⭐'),
        (2,'⭐⭐'),
        (3,'⭐⭐⭐'),
        (4,'⭐⭐⭐⭐'),
        (5,'⭐⭐⭐⭐🌟'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Who wrote the review
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')  # Which product is reviewed
    rating = models.IntegerField(choices=RATING_CHOICES)  # Star rating
    comment = models.TextField(blank=True)  # User’s message
    created_at = models.DateTimeField(auto_now_add=True)  # Date when review is created
    updated_at = models.DateTimeField(auto_now=True)      # Updated timestamp

    class Meta:
        unique_together = ('user', 'product')  # Prevent duplicate reviews

    def __str__(self):
        return f"{self.user} - {self.product.name}"