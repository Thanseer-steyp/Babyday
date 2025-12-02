from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from product.models import Product, Cloth, Jewellery
from .serializers import ProductSerializer, ClothSerializer, JewellerySerializer

# --- Product Views ---
class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductDetailView(APIView):
    def get(self, request, id):
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- Cloth Views ---
class ClothListView(APIView):
    def get(self, request):
        cloths = Cloth.objects.all()
        serializer = ClothSerializer(cloths, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ClothDetailView(APIView):
    def get(self, request, id):
        try:
            cloth = Cloth.objects.get(id=id)
        except Cloth.DoesNotExist:
            return Response({"error": "Cloth not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClothSerializer(cloth)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- Jewellery Views ---
class JewelleryListView(APIView):
    def get(self, request):
        jewelleries = Jewellery.objects.all()
        serializer = JewellerySerializer(jewelleries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class JewelleryDetailView(APIView):
    def get(self, request, id):
        try:
            jewellery = Jewellery.objects.get(id=id)
        except Jewellery.DoesNotExist:
            return Response({"error": "Jewellery not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JewellerySerializer(jewellery)
        return Response(serializer.data, status=status.HTTP_200_OK)
