from rest_framework import serializers
from django.db.models import Avg
from public.models import Product, ProductVariant, ProductMedia


# ✅ Product Variant Serializer
class ProductVariantSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "size",
            "color",
            "image",
            "mrp",
            "price",
            "stock_qty",
            "is_available",
        )

    def get_image(self, obj):
        request = self.context.get("request")

        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url

        return None


# ✅ Product Media Serializer (image/video)
class ProductMediaSerializer(serializers.ModelSerializer):
    media = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia
        fields = (
            "id",
            "media",
            "is_main",
        )

    def get_media(self, obj):
        request = self.context.get("request")

        if obj.media:
            return request.build_absolute_uri(obj.media.url) if request else obj.media.url

        return None


# ✅ Main Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()

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
            "lowest_variant_price",
            "lowest_variant_mrp",
            "delivery_charge",
            "material_type",
            "description",
            "features",
            "size_guide",
            "is_available",
            "average_rating",
            "rating_count",
            "variants",
            "media",
            "created_at",
        )

    # ✅ Ratings
    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg else 0

    def get_rating_count(self, obj):
        return obj.reviews.count()

    # ✅ Variants (only available ones)
    def get_variants(self, obj):
        variants = obj.variants.filter(is_available=True)
        return ProductVariantSerializer(
            variants,
            many=True,
            context=self.context  # ✅ IMPORTANT
        ).data

    # ✅ Price logic (optimized)
    def get_price(self, obj):
        variants = obj.variants.filter(is_available=True, price__isnull=False)

        if variants.exists():
            return variants.order_by("price").first().price

        return obj.price

    # ✅ Media (main first)
    def get_media(self, obj):
        media = obj.media.all().order_by("-is_main")
        return ProductMediaSerializer(
            media,
            many=True,
            context=self.context  # ✅ IMPORTANT
        ).data