from rest_framework import serializers
from public.models import Product
from django.utils.text import slugify

class ProductSerializer(serializers.ModelSerializer):
    slug = serializers.SerializerMethodField()

    
    class Meta:
        model = Product
        fields = '__all__'
        

    def get_slug(self, obj):
        return slugify(obj.title)
