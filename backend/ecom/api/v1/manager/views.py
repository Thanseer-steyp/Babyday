from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser

from public.models import Product
from user.models import Order
from .serializers import (OrderListSerializer)
from api.v1.public.serializers import ProductSerializer
from api.v1.user.serializers import OrderSerializer


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
        return get_object_or_404(Product, slug=slug)


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


class PrepaidPaidOrderView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.filter(
            payment_method="prepaid",
            payment_status="paid"
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders, many=True, context={"request": request}
        )
        return Response(serializer.data, status=200)
    

class AllOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by("-created_at")
        serializer = OrderListSerializer(
            orders,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)
    

class PendingShipmentOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.filter(
            delivery_status="ordered",
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders, many=True, context={"request": request}
        )
        return Response(serializer.data, status=200)
    
class IntransitOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.filter(
            delivery_status="shipped",
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders, many=True, context={"request": request}
        )
        return Response(serializer.data, status=200)
    

class DeliveredOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.filter(
            delivery_status="delivered",
        ).order_by("-created_at")

        serializer = OrderListSerializer(
            orders, many=True, context={"request": request}
        )
        return Response(serializer.data, status=200)
    

class UpdateDeliveryStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found"},
                status=404
            )

        # Optional fields (update only if provided)
        delivery_status = request.data.get("delivery_status")
        delivery_partner = request.data.get("delivery_partner")
        tracking_code = request.data.get("tracking_code")
        remarks = request.data.get("remarks")


        if delivery_status:
            order.delivery_status = delivery_status

        if delivery_partner is not None:
            order.delivery_partner = delivery_partner

        if tracking_code is not None:
            order.tracking_code = tracking_code

        if remarks is not None:
            order.remarks = remarks

        order.save()

        return Response(
            {
                "success": True,
                "order_id": order.id,
                "delivery_status": order.delivery_status,
                "delivery_partner": order.delivery_partner,
                "tracking_code": order.tracking_code,
                "remarks": order.remarks,
            },
            status=200
        )
