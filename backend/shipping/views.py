from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import ShippingAddress, DeliveryStatus
from .serializers import ShippingAddressSerializer, DeliveryStatusSerializer
from orders.models import Order


# =========================================
# SHIPPING ADDRESS (USER)
# =========================================
class ShippingAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = ShippingAddress.objects.filter(user=request.user).order_by("-id")
        serializer = ShippingAddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ShippingAddressSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# =========================================
# VIEW DELIVERY STATUS (LATEST ONLY)
# =========================================
class DeliveryStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, user=request.user)

            # 🔥 IMPORTANT: get latest status (timeline support)
            status_obj = (
                DeliveryStatus.objects
                .filter(order=order)
                .order_by("-created_at")
                .first()
            )

            if not status_obj:
                return Response({"error": "Status not found"}, status=404)

            serializer = DeliveryStatusSerializer(status_obj)
            return Response(serializer.data)

        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)


# =========================================
# ADMIN UPDATE DELIVERY STATUS (CREATE NEW ENTRY)
# =========================================
class UpdateDeliveryStatus(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)

            status_value = request.data.get("status")
            reason = request.data.get("reason", "")

            if not status_value:
                return Response({
                    "error": "Status is required"
                }, status=400)

            # 🔥 VALIDATE STATUS
            valid_status = [choice[0] for choice in DeliveryStatus.STATUS_CHOICES]
            if status_value not in valid_status:
                return Response({
                    "error": "Invalid status"
                }, status=400)

            # 🔥 CREATE NEW ENTRY (DO NOT UPDATE OLD)
            status_obj = DeliveryStatus.objects.create(
                order=order,
                status=status_value,
                reason=reason
            )

            serializer = DeliveryStatusSerializer(status_obj)
            return Response(serializer.data)

        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)