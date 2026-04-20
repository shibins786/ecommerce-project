from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")
    image = serializers.SerializerMethodField()   # 🔥 FIX: safe image URL handling

    class Meta:
        model = Product
        fields = "__all__"

    # 🔥 FIX: return FULL image URL (VERY IMPORTANT for frontend)
    def get_image(self, obj):
        request = self.context.get("request")

        if obj.image and hasattr(obj.image, "url"):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    # validation
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be >= 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock must be >= 0")
        return value