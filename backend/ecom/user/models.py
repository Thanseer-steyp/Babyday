from django.db import models
from django.contrib.auth.models import User
from public.models import Product

from django.conf import settings
from django.db import models

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,related_name="addresses")

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    alt_phone = models.CharField(max_length=15, blank=True, null=True)

    pincode = models.CharField(max_length=6)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    address_line = models.TextField(blank=True, null=True)
    landmark = models.CharField(max_length=100, blank=True, null=True)

    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.city}"


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=10, blank=True, null=True)  # new field
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product', 'size')  # unique per size

    def __str__(self):
        return f"{self.user.username} - {self.product.title} ({self.size})"



class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.user} - {self.product}"
    

class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ("initiated", "Initiated"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]
    PAYMENT_METHOD_CHOICES = [
        ("prepaid", "Prepaid"),
        ("cod", "Cash on Delivery"),
    ]

    PAYMENT_CHANNEL_CHOICES = [
        ("upi", "UPI"),
        ("card", "Card"),
        ("netbanking", "NetBanking"),
        ("wallet", "Wallet"),
        ("unknown", "Unknown"),
    ]
    DELIVERY_STATUS_CHOICES = [
        ("ordered", "Ordered"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    product_slug = models.SlugField()
    size = models.CharField(max_length=50, blank=True)
    qty = models.PositiveIntegerField(default=1)
    mrp = models.FloatField()
    price = models.FloatField()
    discount = models.FloatField(default=0)
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default="prepaid"
    )
    payment_channel = models.CharField(
        max_length=20, choices=PAYMENT_CHANNEL_CHOICES, default="unknown"
    )
    delivery_charge = models.FloatField(default=0)
    total = models.FloatField()
    razorpay_order_id = models.CharField(max_length=255, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="initiated"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    name = models.CharField(max_length=100)          # delivery name
    phone = models.CharField(max_length=15)         # phone number
    alt_phone = models.CharField(max_length=15, blank=True, null=True)
    pincode = models.CharField(max_length=6)
    state = models.CharField(max_length=50)
    city = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    address_line = models.TextField(blank=True, null=True)
    landmark = models.CharField(max_length=100, blank=True, null=True)


    delivery_status = models.CharField(
        max_length=20, choices=DELIVERY_STATUS_CHOICES, default="ordered"
    )
    delivery_partner = models.CharField(max_length=100, blank=True, null=True)
    tracking_code = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.product_name} - {self.payment_method} ({self.payment_status})"