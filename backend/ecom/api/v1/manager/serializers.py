from rest_framework import serializers
from public.models import Product
from django.utils.text import slugify

# class ProductSerializer(serializers.ModelSerializer):
#     slug = serializers.SerializerMethodField()

    
#     class Meta:
#         model = Product
#         fields = '__all__'
        

#     def get_slug(self, obj):
#         return slugify(obj.title)

#     def get_available_stock(self, obj):
#         sold_qty = Order.objects.filter(
#             product_name=obj.title,
#             payment_status__in=["paid", "initiated"]
#         ).aggregate(total=Sum("qty"))["total"] or 0

#         return obj.stock_qty - sold_qty
