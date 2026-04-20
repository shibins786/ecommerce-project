from django.db import models
from django.contrib.auth.models import AbstractUser


# =========================
# CUSTOM USER MODEL (EMAIL LOGIN BASED)
# =========================
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15, blank=True, null=True)

    USERNAME_FIELD = "email"   # 🔥 login uses email
    REQUIRED_FIELDS = ["username"]


# =========================
# OTP TABLE
# =========================
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)

    created_at = models.DateTimeField(auto_now_add=True)

    is_used = models.BooleanField(default=False)  # 🔥 prevents reuse

    def __str__(self):
        return f"{self.user.email} - {self.otp}"