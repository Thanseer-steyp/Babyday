from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from public.models import Product
from .serializers import ProductSerializer


class ProductListView(APIView):

    def get(self, request):
        products = Product.objects.filter(is_available=True)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductDetailView(APIView):

    def get(self, request, slug):
        # Match slug dynamically
        product = get_object_or_404(
            Product,
            title__iexact=slug.replace("-", " ")  # simple match
        )
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)