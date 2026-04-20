from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    SendOTPView,
    VerifyOTPView,
    ResetPasswordView
)

urlpatterns = [
    # =========================
    # AUTH
    # =========================
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),

    # ✅ CRITICAL (THIS FIXES YOUR ISSUE)
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # =========================
    # FORGOT PASSWORD FLOW
    # =========================
    path("forgot/send-otp/", SendOTPView.as_view(), name="send_otp"),
    path("forgot/verify-otp/", VerifyOTPView.as_view(), name="verify_otp"),
    path("forgot/reset/", ResetPasswordView.as_view(), name="reset_password"),
]