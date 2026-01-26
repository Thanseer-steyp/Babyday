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
from django.db import transaction


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        items = data.get("items", [])
        addr = data.get("address", {}) 

        if not items:
            return Response({"detail": "No items to checkout"},status=400)

        calculated_items = [] 
        grand_total = 0



        #rem free delivery
        #-------------------------------------------------
        subtotal = 0  

        for item in items:
            product = Product.objects.get(slug=item["slug"])
            qty = int(item["qty"])
            subtotal += float(product.price) * qty

        # 2️⃣ CART LEVEL FREE DELIVERY
        is_free_delivery = subtotal >= 2000
        
        #-------------------------------------------------


        for item in items:
            product = Product.objects.get(slug=item["slug"])

            qty = int(item["qty"])
            size = item.get("size", "")
            
            price = float(product.price)
            mrp = float(product.mrp)
            delivery = float(product.delivery_charge or 0)

            # size validation
            if product.available_sizes and not size:
                return Response(
                    {"detail": f"Size required for {product.title}"},
                    status=400
                )
            
        
            #-------------------------------------------------
             # ✅ APPLY FREE DELIVERY
            if is_free_delivery:
                delivery = 0
            #-------------------------------------------------




            
            #if price * qty > 2000:
                #delivery = 0

            item_mrp = mrp * qty
            item_discount = (mrp - price) * qty
            item_price = price * qty
            item_delivery_charge = delivery * qty
            item_total = (price * qty) + item_delivery_charge

            sold_qty = Order.objects.filter(
                product_slug=product.slug,
                payment_status__in=["paid", "initiated"]
            ).aggregate(total=Sum("qty"))["total"] or 0


            if product.stock_qty - sold_qty < qty:
                return Response(
                    {"detail": f"Only {product.stock_qty - sold_qty} left for {product.title}"},
                    status=400
                )


            calculated_items.append({
                "item": item,
                "qty": qty,
                "size": size,
                "item_mrp": item_mrp,
                "item_discount": item_discount,
                "item_price":item_price,
                "item_delivery_charge": item_delivery_charge,
                "item_total": item_total,
            })

            grand_total += item_total


        # COD ORDER
        if data.get("payment_method") == "cod":
            orders = []
            for calc in calculated_items:
                item = calc["item"]
                order = Order.objects.create(
                    user=request.user,
                    product_name=item["title"],
                    product_slug=item["slug"],
                    qty=calc["qty"],
                    size=calc["size"],

                    price=calc["item_price"],
                    mrp=calc["item_mrp"],    
                    discount=calc["item_discount"],
                    delivery_charge=calc["item_delivery_charge"],
                    total=calc["item_total"],

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
                orders.append(order)
            Cart.objects.filter(user=request.user).delete()
            send_admin_order_email(orders)

            return Response({
                "success": True,
                "order_count": len(orders),
                "grand_total": grand_total,
                "items": calculated_items,
                "address": addr,

            })

        # PREPAID ORDER
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        razorpay_order = client.order.create({
            "amount": int(grand_total * 100),
            "currency": "INR",
            "payment_capture": 1,
        })

        return Response({
            "success": True,
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "razorpay_key": settings.RAZORPAY_KEY_ID,
            "items": calculated_items,
            "address": addr,
        })



class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        addr = data.get("address", {}) 

        try:
            client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )

            client.utility.verify_payment_signature({
                "razorpay_order_id": data["razorpay_order_id"],
                "razorpay_payment_id": data["razorpay_payment_id"],
                "razorpay_signature": data["razorpay_signature"],
            })

            payment = client.payment.fetch(data["razorpay_payment_id"])
            payment_channel = payment.get("method")

            orders = []



            #-----------------------------------------------------
            subtotal = 0  # ✅ NEW
            for item in data["items"]:
                product = Product.objects.get(slug=item["slug"])
                subtotal += float(product.price) * int(item["qty"])

            is_free_delivery = subtotal >= 2000
            #--------------------------------------------------------------
            

            with transaction.atomic():
                for item in data["items"]:
                    qty = int(item["qty"])
                    size = item.get("size", "")

                    product = Product.objects.select_for_update().get(
                    slug=item["slug"]
    )

                    price = float(product.price)
                    mrp = float(product.mrp)
                    delivery = float(product.delivery_charge or 0)


                    if is_free_delivery:
                        delivery = 0
                        
                    # Free delivery rule
                    #if price * qty > 2000:
                        #delivery = 0

                    sold_qty = Order.objects.filter(
                        product_slug=product.slug,
                        payment_status__in=["paid", "initiated"]
                    ).aggregate(total=Sum("qty"))["total"] or 0

                    if product.stock_qty - sold_qty < qty:
                        raise ValueError(f"Stock exhausted for {product.title}")

                    item_mrp = mrp * qty
                    item_price = price * qty
                    item_discount = (mrp - price) * qty
                    item_delivery_charge = delivery * qty
                    item_total = item_price + item_delivery_charge

                    order = Order.objects.create(
                        user=request.user,
                        product_name=item["title"],
                        product_slug=item["slug"],
                        qty=qty,
                        size=size,

                        price=item_price,
                        mrp=item_mrp,    
                        discount=item_discount,
                        delivery_charge=item_delivery_charge,
                        total=item_total,

                        payment_method="prepaid",
                        payment_status="paid",  
                        razorpay_order_id=data["razorpay_order_id"],
                        razorpay_payment_id=data["razorpay_payment_id"],
                        razorpay_signature=data["razorpay_signature"],
                        payment_channel=payment_channel, 

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
                    orders.append(order)

            Cart.objects.filter(user=request.user).delete()
            send_admin_order_email(list(orders))

            return Response({"success": True})

        except SignatureVerificationError:
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
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
        })


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        size = request.data.get("size")

        if not size:
            return Response(
                {"detail": "Size is required"},
                status=400
            )

        product = get_object_or_404(
            Product,
            slug=slug,
            is_available=True
        )

        variant = ProductVariant.objects.filter(
            product=product,
            size=size,
            is_active=True
        ).first()

        if not variant:
            return Response(
                {"detail": "Invalid or unavailable size"},
                status=400
            )

        if variant.stock_qty < 1:
            return Response(
                {"detail": "Out of stock"},
                status=400
            )

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            variant=variant,
            defaults={"product": product}
        )

        if not created:
            if cart_item.quantity >= variant.stock_qty:
                return Response(
                    {"detail": "Stock limit reached"},
                    status=400
                )
            cart_item.quantity += 1
            cart_item.save()

        return Response(
            {"message": "Added to cart"},
            status=200
        )




class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        size = request.data.get("size")
        if not size:
            return Response({"detail": "Size required"}, status=400)

        product = Product.objects.filter(slug=slug).first()


        if not product:
            return Response({"detail": "Product not found"}, status=404)

        Cart.objects.filter(user=request.user, product=product,size=request.data.get("size")).delete()
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
        action = request.data.get("action")
        size = request.data.get("size")

        product = get_object_or_404(Product, slug=slug)
        variant = get_object_or_404(ProductVariant, product=product, size=size)

        cart_item = get_object_or_404(
            Cart,
            user=request.user,
            variant=variant
        )

        if action == "increase":
            if cart_item.quantity >= variant.stock_qty:
                return Response(
                    {"detail": "Stock limit reached"},
                    status=400
                )
            cart_item.quantity += 1

        elif action == "decrease" and cart_item.quantity > 1:
            cart_item.quantity -= 1

        cart_item.save()

        return Response({
            "qty": cart_item.quantity,
            "available_stock": variant.stock_qty
        })



class AddToWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        
        product = Product.objects.filter(slug=slug).first()


        if not product:
            return Response({"message": "Product not found"}, status=400)

        # Create wishlist entry
        Wishlist.objects.get_or_create(user=request.user, product=product)
        return Response({"message": "Added to wishlist"}, status=200)


class RemoveFromWishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug):
        # Look for product manually
        product = Product.objects.filter(slug=slug).first()


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
    


class OrderListView(APIView):
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

        product = Product.objects.get(slug=order.product_slug)


        ProductRating.objects.create(
            product=product,
            user=request.user,
            order=order,
            rating=rating,
            review=review
        )

        return Response({"success": True}, status=201)
