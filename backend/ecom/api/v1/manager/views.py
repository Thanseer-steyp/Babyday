from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser

from public.models import Product
from .serializers import ProductSerializer


class ManageProductView(APIView):
    permission_classes = [IsAdminUser]

    # LIST
    def get(self, request):
        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # CREATE
    def post(self, request):
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ManageProductDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, slug):
        return get_object_or_404(
            Product,
            title__iexact=slug.replace('-', ' ')
        )

    # READ
    def get(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # FULL UPDATE
    def put(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(
            product,
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PARTIAL UPDATE
    def patch(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    def delete(self, request, slug):
        product = self.get_object(slug)
        product.delete()
        return Response(
            {"detail": "Product deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
