from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from .models import Subscriber


# ================================
# SUBSCRIBE
# ================================
class Subscribe(APIView):
    def post(self, request):
        email = request.data.get("email")

        # 🔴 VALIDATION
        if not email:
            return Response({
                "error": True,
                "message": "Email required"
            }, status=400)

        if Subscriber.objects.filter(email=email).exists():
            return Response({
                "error": True,
                "message": "Already subscribed"
            }, status=400)

        # ✅ SAVE EMAIL
        Subscriber.objects.create(email=email)

        # 🔗 UNSUBSCRIBE LINK
        unsubscribe_link = f"http://localhost:5173/unsubscribe?email={email}"

        # 🎨 HTML EMAIL
        subject = "🎉 Welcome to ShopApp!"

        html_content = f"""
        <div style="font-family:Arial;background:#f4f6f8;padding:20px;">
            <div style="max-width:600px;margin:auto;background:#ffffff;padding:30px;border-radius:12px;box-shadow:0 5px 20px rgba(0,0,0,0.1);">

                <h2 style="color:#222;">Welcome to ShopApp 🚀</h2>

                <p style="font-size:16px;color:#555;">
                    You're successfully subscribed! 🎉
                </p>

                <p style="color:#444;">
                    Here's what you’ll get:
                </p>

                <ul style="color:#333;line-height:1.6;">
                    <li>🔥 Latest product updates</li>
                    <li>💸 Exclusive discounts</li>
                    <li>🎁 Special offers</li>
                </ul>

                <p style="margin-top:20px;color:#555;">
                    Stay tuned — exciting deals are coming your way!
                </p>

                <div style="margin-top:30px;text-align:center;">
                    <a href="https://lucky-feet-fall.loca.lt"
                       style="background:#000;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">
                       Visit Shop
                    </a>
                </div>

                <hr style="margin:30px 0;" />

                <p style="font-size:12px;color:#888;text-align:center;">
                    Don't want these emails?
                    <a href="{unsubscribe_link}" style="color:red;">
                        Unsubscribe here
                    </a>
                </p>

            </div>
        </div>
        """

        # 📩 SEND EMAIL
        try:
            email_message = EmailMultiAlternatives(
                subject=subject,
                body="You are subscribed to ShopApp updates.",  # fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )

            email_message.attach_alternative(html_content, "text/html")
            email_message.send()

        except Exception as e:
            return Response({
                "error": True,
                "message": f"Saved but email failed: {str(e)}"
            }, status=500)

        return Response({
            "error": False,
            "message": "Subscribed successfully & email sent 🎉"
        })


# ================================
# UNSUBSCRIBE
# ================================
class Unsubscribe(APIView):
    def get(self, request):
        email = request.query_params.get("email")

        if not email:
            return Response({
                "error": True,
                "message": "Email required"
            }, status=400)

        Subscriber.objects.filter(email=email).delete()

        return Response({
            "error": False,
            "message": "You have been unsubscribed"
        })