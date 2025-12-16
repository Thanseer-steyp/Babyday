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


# views.py
from django.utils.text import slugify

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from user.models import Cart,Wishlist
from public.models import Product
from .serializers import CartSerializer,WishlistSerializer


# views.py
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        size = request.data.get("size")  # get selected size
        if not size:
            return Response({"message": "Size is required"}, status=400)

        product = None
        for p in Product.objects.filter(is_available=True):
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"detail": "Product not found"}, status=404)

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            size=size  # store size
        )

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return Response({"message": "Added to cart"}, status=200)



class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        product = None
        for p in Product.objects.all():
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"detail": "Product not found"}, status=404)

        Cart.objects.filter(user=request.user, product=product).delete()
        return Response({"message": "Removed from cart"}, status=200)


class CartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True, context={"request": request})
        return Response(serializer.data, status=200)






class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        # Look for product manually instead of get_object_or_404
        product = None
        for p in Product.objects.all():
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"message": "Product not found"}, status=400)

        # Create wishlist entry
        Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({"message": "Added to wishlist"}, status=200)


class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        # Look for product manually
        product = None
        for p in Product.objects.all():
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"message": "Product not found"}, status=400)

        # Remove from wishlist
        Wishlist.objects.filter(user=request.user, product=product).delete()
        return Response({"message": "Removed from wishlist"}, status=200)
    


class WishlistListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(
            wishlist__user=request.user
        )
        serializer = WishlistSerializer(
            products, many=True, context={"request": request}
        )
        return Response(serializer.data)