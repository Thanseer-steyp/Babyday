# serializers.py

from rest_framework import serializers
from django.utils.text import slugify
from user.models import Cart,Address
from public.models import Product


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = "__all__"
        read_only_fields = ("user",)


class CartSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="product.title", read_only=True)
    price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)
    image1 = serializers.ImageField(source="product.image1", read_only=True)
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "product_id",
            "title",
            "price",
            "image1",
            "slug",
            "quantity",
            "size",
        ]

    def get_slug(self, obj):
        return slugify(obj.product.title)





class WishlistSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "price",
            "image1",
            "slug",
        ]

    def get_slug(self, obj):
        return slugify(obj.title)
