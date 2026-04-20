from rest_framework import serializers
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

    def get_product(self, obj):
        request = self.context.get("request")  # ✅ IMPORTANT for full URL

        image_url = None
        if obj.product.image:
            if request:
                image_url = request.build_absolute_uri(obj.product.image.url)
            else:
                image_url = obj.product.image.url

        return {
            "id": obj.product.id,
            "name": obj.product.name,
            "price": obj.product.price,
            "image": image_url,   # ✅ FIXED (full URL support)
        }


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items']