from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, LoginSerializer
import razorpay
from django.conf import settings
from .models import Product, Order
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Product
from .serializers import ProductSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated



class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Signup successful"}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })




class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]  # JWT required

    def post(self, request):
        product_id = request.data.get("product_id")
        product = Product.objects.get(id=product_id)

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = client.order.create({
            "amount": product.price * 100,
            "currency": "INR",
        })

        order = Order.objects.create(
            user=request.user,
            product=product,
            razorpay_order_id=razorpay_order['id']
        )

        return Response({
            "order_id": razorpay_order['id'],
            "amount": product.price * 100,
            "key": settings.RAZORPAY_KEY_ID,
            "product": product.name
        })

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]  # JWT required

    def post(self, request):
        payload = request.data

        order = Order.objects.get(razorpay_order_id=payload['razorpay_order_id'])
        order.razorpay_payment_id = payload['razorpay_payment_id']
        order.paid = True
        order.save()

        return Response({"message": "Payment verified"})



class ProductListView(ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductDetailView(RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
