# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.conf import settings
# import razorpay
# from user.models import Order
# from product.models import Cloth,Jewellery






# class CreateRazorpayOrderView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         product_type = request.data.get("product_type")
#         product_id = request.data.get("product_id")

#         # fetch correct product
#         if product_type == "cloth":
#             product = Cloth.objects.get(id=product_id)
#         elif product_type == "jewellery":
#             product = Jewellery.objects.get(id=product_id)
#         else:
#             return Response({"error": "Invalid product type"}, status=400)

#         client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

#         razorpay_order = client.order.create({
#             "amount": product.price * 100,
#             "currency": "INR",
#         })

#         # Create Order
#         Order.objects.create(
#             user=request.user,
#             product_type=product_type,
#             product_id=product_id,
#             razorpay_order_id=razorpay_order['id']
#         )

#         return Response({
#             "order_id": razorpay_order['id'],
#             "amount": product.price * 100,
#             "key": settings.RAZORPAY_KEY_ID,
#             "product": product.name
#         })


# class VerifyPaymentView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         data = request.data

#         order = Order.objects.get(razorpay_order_id=data['razorpay_order_id'])
#         order.razorpay_payment_id = data['razorpay_payment_id']
#         order.paid = True
#         order.save()

#         return Response({"message": "Payment verified"})




