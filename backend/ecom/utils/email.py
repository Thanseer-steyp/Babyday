from django.core.mail import EmailMessage
from django.conf import settings


def send_admin_order_email(order):
    subject = f"🛒 New Order Received | Order #{order.id}"

    message = f"""
NEW ORDER RECEIVED
==================

ORDER INFO

    Order ID: {order.id}
    Order Date: {order.created_at}
    Payment Method: {order.payment_method.upper()}
    Payment Status: {order.payment_status.upper()}
    Payment Channel: {order.payment_channel or "N/A"}

RAZORPAY DETAILS

    Razorpay Order ID: {order.razorpay_order_id or "N/A"}
    Razorpay Payment ID: {order.razorpay_payment_id or "N/A"}

PRODUCT DETAILS

    Product Name: {order.product_name}
    Product Slug: {order.product_slug}
    Size: {order.size}
    Quantity: {order.qty}

PRICING

    MRP: ₹{order.mrp}
    Selling Price: ₹{order.price}
    Discount: ₹{order.discount}
    Delivery Fee: ₹{order.delivery_charge}
    
    TOTAL AMOUNT: ₹{order.total}

CUSTOMER DETAILS

    Name: {order.name}
    Email: {order.user.email if order.user and order.user.email else "Not provided"}
    Phone: {order.phone}
    Alt Phone: {order.alt_phone if order.alt_phone else "Not provided"}

DELIVERY ADDRESS

    Address: {order.address_line if order.address_line else "Not Provided"}
    Location: {order.location}
    City/State: {order.city}, {order.state}
    Pincode: {order.pincode}
    Landmark: {order.landmark if order.landmark else "Not Provided"}

=====================
This is an automated order alert.
"""

    email = EmailMessage(
        subject=subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.ORDER_NOTIFICATION_EMAIL],
    )
    email.send(fail_silently=False)
