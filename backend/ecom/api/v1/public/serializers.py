from rest_framework import serializers
from public.models import Product
from user.models import Order
from django.utils.text import slugify
from django.db.models import Avg, Count,Sum

class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    available_stock = serializers.SerializerMethodField()

    
    class Meta:
        model = Product
        fields = '__all__'
        

    def get_slug(self, obj):
        return slugify(obj.title)

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg else 0

    def get_rating_count(self, obj):
        return obj.reviews.count()

    def get_available_stock(self, obj):
        sold_qty = Order.objects.filter(
            product_name=obj.title,
            payment_status__in=["paid", "initiated"]
        ).aggregate(total=Sum("qty"))["total"] or 0

        return obj.stock_qty - sold_qty