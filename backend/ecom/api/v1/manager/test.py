class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        items = data.get("items", [])
        addr = data.get("address", {})

        if not items:
            return Response({"detail": "No items to checkout"}, status=400)

        orders = []
        grand_total = 0
        calculated_items = []  # ✅ STORE ITEM DATA

        # ---------------- CALCULATION LOOP ----------------
        for item in items:
            product = Product.objects.get(title__iexact=item["title"])

            qty = int(item["qty"])
            size = item.get("size", "")

            price = float(product.price)
            mrp = float(product.mrp)
            delivery = float(product.delivery_charge or 0)

            if product.available_sizes and not size:
                return Response(
                    {"detail": f"Size required for {product.title}"},
                    status=400
                )

            item_mrp = mrp * qty
            item_delivery_charge = delivery * qty
            item_discount = (mrp - price) * qty
            item_total = (price * qty) + item_delivery_charge

            grand_total += item_total

            calculated_items.append({
                "item": item,
                "qty": qty,
                "size": size,
                "item_mrp": item_mrp,
                "item_discount": item_discount,
                "item_delivery_charge": item_delivery_charge,
                "item_total": item_total,
            })

        # ---------------- COD ----------------
        if data.get("payment_method") == "cod":
            for calc in calculated_items:
                item = calc["item"]

                order = Order.objects.create(
                    user=request.user,
                    product_name=item["title"],
                    product_slug=item["slug"],
                    qty=calc["qty"],
                    size=calc["size"],

                    price=item["price"],
                    mrp=calc["item_mrp"],
                    discount=calc["item_discount"],
                    delivery_charge=calc["item_delivery_charge"],
                    total=calc["item_total"],

                    payment_method="cod",
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
                orders.append(order)

            return Response({
                "success": True,
                "order_count": len(orders),
                "grand_total": grand_total,
            })

        # ---------------- PREPAID ----------------
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        razorpay_order = client.order.create({
            "amount": int(grand_total * 100),  # ✅ FULL CART
            "currency": "INR",
            "payment_capture": 1,
        })

        for calc in calculated_items:
            item = calc["item"]

            Order.objects.create(
                user=request.user,
                product_name=item["title"],
                product_slug=item["slug"],
                qty=calc["qty"],
                size=calc["size"],

                price=item["price"],
                mrp=calc["item_mrp"],
                discount=calc["item_discount"],
                delivery_charge=calc["item_delivery_charge"],
                total=calc["item_total"],

                payment_method="prepaid",
                payment_status="initiated",
                razorpay_order_id=razorpay_order["id"],

                name=addr.get("name", ""),
                phone=addr.get("phone", ""),
                alt_phone=addr.get("alt_phone", ""),
                pincode=addr.get("pincode", ""),
                state=addr.get("state", ""),
                city=addr.get("city", ""),
                location=addr.get("location", ""),
                address_line=addr.get("address_line", ""),
