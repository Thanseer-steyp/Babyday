from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser

from public.models import Product
from .serializers import ProductSerializer


class ProductView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]        # 👀 Anyone can view
        return [IsAdminUser()]        # 🔒 Only admin can create

    def get(self, request):
        products = Product.objects.filter(is_available=True)
        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ProductDetailView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]        # 👀 Anyone can view
        return [IsAdminUser()]        # 🔒 Only admin can edit/delete

    def get_object(self, slug):
        return get_object_or_404(
            Product,
            title__iexact=slug.replace("-", " ")
        )

    def get(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(product, context={"request": request})
        return Response(serializer.data)

    def patch(self, request, slug):
        product = self.get_object(slug)
        serializer = ProductSerializer(product, data=request.data, partial=True,)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, slug):
        product = self.get_object(slug)
        product.delete()
        return Response({"message": "Deleted"}, status=204)