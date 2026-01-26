from rest_framework import serializers
from public.models import Product, ProductVariant
from django.db.models import Avg, Sum


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "size",
            "price",
            "stock_qty",
            "is_active",
        )


class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "age_category",
            "product_category",
            "mrp",
            "price",
            "delivery_charge",
            "material_type",
            "fit_type",
            "pattern_design",
            "age_limits",
            "image1",
            "image2",
            "image3",
            "image4",
            "is_available",
            "average_rating",
            "rating_count",
            "variants",
            "created_at",
        )

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg else 0

    def get_rating_count(self, obj):
        return obj.reviews.count()

    def get_variants(self, obj):
        variants = obj.variants.filter(is_active=True)
        return ProductVariantSerializer(variants, many=True).data

    def get_price(self, obj):
        prices = []

        for variant in obj.variants.filter(is_active=True):
            if variant.price is not None:
                prices.append(variant.price)
            elif obj.common_price is not None:
                prices.append(obj.common_price)

        return min(prices) if prices else None



