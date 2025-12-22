from django.utils.text import slugify
from rest_framework import serializers
from user.models import Cart,Address,Order
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





class OrderSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = [
            "user",
            "razorpay_order_id",
            "razorpay_payment_id",
            "razorpay_signature",
        ]
    def get_product_image(self, obj):
        try:
            product = Product.objects.get(title=obj.product_name)
            if product.image1:
                request = self.context.get("request")
                return request.build_absolute_uri(product.image1.url) if request else product.image1.url
            return None
        except Product.DoesNotExist:
            return None