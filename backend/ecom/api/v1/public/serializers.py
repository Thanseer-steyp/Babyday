from rest_framework import serializers
from product.models import Product, Cloth, Jewellery

# Serializer for Product (common fields)
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'category']

# Serializer for Cloth (including sizes)
class ClothSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Cloth
        fields = ['id', 'product', 'sizes', 'colors']

# Serializer for Jewellery (including material)
class JewellerySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Jewellery
        fields = ['id', 'product', 'material']
