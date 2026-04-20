from django.db import models
from django.conf import settings
from products.models import Product

User = settings.AUTH_USER_MODEL

class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Each user has one wishlist

    def __str__(self):
        return str(self.user)

class WishlistItem(models.Model):  # Products inside wishlist
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('wishlist', 'product')  # Prevent duplicate products

    def __str__(self):
        return self.product.name