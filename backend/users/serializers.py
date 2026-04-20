from rest_framework import serializers
from .models import User


# =========================
# REGISTER
# =========================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return user


# =========================
# LOGIN
# =========================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


# =========================
# FORGOT PASSWORD - SEND OTP
# =========================
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


# =========================
# VERIFY OTP
# =========================
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


# =========================
# RESET PASSWORD
# =========================
class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField()