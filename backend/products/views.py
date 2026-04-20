from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Product
from .serializers import ProductSerializer


# ==============================
# PRODUCT LIST + CREATE
# ==============================
class ProductList(ListCreateAPIView):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']

    def create(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can add products"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


# ==============================
# PRODUCT DETAIL (FIXED VERSION)
# ==============================
class ProductDetail(RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    # ✅ FIX: no custom lookup_field needed
    # DRF will automatically use "pk" from URL

    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can update products"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin can delete products"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)