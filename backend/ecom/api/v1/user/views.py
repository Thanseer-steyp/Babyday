from django.utils.text import slugify
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user.models import Cart,Wishlist,Address,Order,ProductRating
from public.models import Product
from .serializers import CartSerializer,WishlistSerializer,AddressSerializer,OrderSerializer,ProductRatingSerializer
import razorpay
from razorpay.errors import SignatureVerificationError
from utils.email import send_admin_order_email
from django.db.models import Sum


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        addr = data.get("address", {}) 
        

        product = Product.objects.get(title__iexact=data["title"])
        size = data.get("size", "")

        # size required ONLY if product has sizes
        if product.available_sizes and not size:
            return Response(
                {"detail": "Size selection is required"},
                status=400
            )



        sold_qty = Order.objects.filter(
            product_name=product.title,
            payment_status__in=["paid", "initiated"]  # prepaid + COD
        ).aggregate(total=Sum("qty"))["total"] or 0

        available_qty = product.stock_qty - sold_qty

        if available_qty < int(data["qty"]):
            return Response(
                {"detail": f"Only {available_qty} items left"},
                status=400
            )

        # COD ORDER
        if data.get("payment_method") == "cod":
            order = Order.objects.create(
                user=request.user,
                product_name=data["title"],
                product_slug=data["slug"],
                qty=data["qty"],
                size=data.get("size", ""),
                price=data["price"],
                mrp=data["mrp"],    
                discount=data["discount"],
                delivery_charge=data["delivery_charge"],
                total=data["total"],
                payment_method="cod",
                payment_status="initiated",  # COD is unpaid initially

                name=addr.get("name", ""),
                phone=addr.get("phone", ""),
                alt_phone=addr.get("alt_phone", ""),
                pincode=addr.get("pincode", ""),
                state=addr.get("state", ""),
                city=addr.get("city", ""),
                location=addr.get("location", ""),
                address_line=addr.get("address_line", ""),
                landmark=addr.get("landmark", ""),
            )

            send_admin_order_email(order)

            return Response({
                "success": True,
                "order_id": order.id
            })

        # PREPAID ORDER
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        razorpay_order = client.order.create({
            "amount": int(float(data["total"]) * 100),
            "currency": "INR",
            "payment_capture": 1,
        })

        order = Order.objects.create(
            user=request.user,
            product_name=data["title"],
            product_slug=data["slug"],
            qty=data["qty"],
            size=data.get("size", ""),
            price=data["price"],
            mrp=data["mrp"],
            discount=data["discount"],
            delivery_charge=data["delivery_charge"],
            total=data["total"],
            payment_method="prepaid",
            razorpay_order_id=razorpay_order["id"],
            payment_status="initiated",

            name=addr.get("name", ""),
            phone=addr.get("phone", ""),
            alt_phone=addr.get("alt_phone", ""),
            pincode=addr.get("pincode", ""),
            state=addr.get("state", ""),
            city=addr.get("city", ""),
            location=addr.get("location", ""),
            address_line=addr.get("address_line", ""),
            landmark=addr.get("landmark", ""),
        )

        return Response({
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "title": order.product_name,
        })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

            client.utility.verify_payment_signature({
                "razorpay_order_id": data["razorpay_order_id"],
                "razorpay_payment_id": data["razorpay_payment_id"],
                "razorpay_signature": data["razorpay_signature"],
            })

            order = Order.objects.get(
                razorpay_order_id=data["razorpay_order_id"]
            )

            order.razorpay_payment_id = data["razorpay_payment_id"]
            order.razorpay_signature = data["razorpay_signature"]
            order.payment_status = "paid"
            order.payment_channel = "upi"  # optional: detect dynamically
            order.save()

            send_admin_order_email(order)

            return Response({"success": True})

        except (SignatureVerificationError, Order.DoesNotExist):
            Order.objects.filter(
                razorpay_order_id=data.get("razorpay_order_id")
            ).update(payment_status="failed")

            return Response(
                {"success": False, "message": "Payment verification failed"},
                status=400
            )


class AddressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        address = Address.objects.filter(user=request.user).first()
        if not address:
            return Response({}, status=status.HTTP_200_OK)

        serializer = AddressSerializer(address)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)

    def put(self, request):
        address = Address.objects.filter(user=request.user).first()
        if not address:
            return Response({"detail": "Address not found"}, status=404)

        serializer = AddressSerializer(
            address, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email
        })


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        size = request.data.get("size")  # get selected size
        

        product = None
        for p in Product.objects.filter(is_available=True):
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"detail": "Product not found"}, status=404)

        if product.available_sizes and not size:
            return Response(
                {"message": "Please select a size"},
                status=400
            )


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



class UpdateCartQtyView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, slug):
        action = request.data.get("action")  # "increase" or "decrease"

        if action not in ["increase", "decrease"]:
            return Response(
                {"detail": "Invalid action"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # find product by slug
        product = None
        for p in Product.objects.filter(is_available=True):
            if slugify(p.title) == slug:
                product = p
                break

        if not product:
            return Response({"detail": "Product not found"}, status=404)

        cart_item = Cart.objects.filter(
            user=request.user,
            product=product
        ).first()

        if not cart_item:
            return Response(
                {"detail": "Item not in cart"},
                status=404
            )
        sold_qty = Order.objects.filter(
            product_name=product.title,
            payment_status__in=["paid", "initiated"]
        ).aggregate(total=Sum("qty"))["total"] or 0

        available_stock = product.stock_qty - sold_qty
        # quantity logic (min=1, max=3)
        if action == "increase":
            if cart_item.quantity < available_stock:
                cart_item.quantity += 1
            else : 
                return Response(
                    {"detail": f"Only {available_stock} items available"},
                    status=400
                )

        elif action == "decrease" and cart_item.quantity > 1:
            cart_item.quantity -= 1

        cart_item.save()

        return Response(
            {
                "message": "Quantity updated",
                "qty": cart_item.quantity,
                "available_stock": available_stock
            },
            status=200
        )



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
    


class OrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True, context={"request": request})
        return Response(serializer.data)



class CreateRatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        rating = request.data.get("rating")
        review = request.data.get("review", "")

        if not rating or not (1 <= int(rating) <= 5):
            return Response({"detail": "Invalid rating"}, status=400)

        try:
            order = Order.objects.get(
                id=order_id,
                user=request.user,
                delivery_status="delivered"
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not delivered"},
                status=403
            )

        # ✅ SAFE & CORRECT
        product = Product.objects.get(title=order.product_name)

        ProductRating.objects.create(
            product=product,
            user=request.user,
            order=order,
            rating=rating,
            review=review
        )

        return Response({"success": True}, status=201)
