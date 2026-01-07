from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from public.models import Product
from .serializers import ProductSerializer


class ProductView(APIView):

    def get(self, request):
        products = Product.objects.filter(is_available=True)
        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)



class ProductDetailView(APIView):

    def get_object(self, slug):
        return get_object_or_404(Product, slug=slug)


    def get(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(product, context={"request": request})
        return Response(serializer.data)
