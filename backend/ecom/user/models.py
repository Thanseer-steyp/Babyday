# from django.db import models
# from django.contrib.auth.models import User
# from product.models import Cloth,Jewellery
# from django.contrib.auth.models import User
# from product.models import Cloth, Jewellery


# class Order(models.Model):
#     PRODUCT_TYPES = (
#         ("cloth", "Cloth"),
#         ("jewellery", "Jewellery"),
#     )

#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES,null=True)
#     product_id = models.IntegerField(null=True)

#     razorpay_order_id = models.CharField(max_length=200)
#     razorpay_payment_id = models.CharField(max_length=200, null=True, blank=True)
#     paid = models.BooleanField(default=False)

#     def __str__(self):
#         product = self.get_product()
#         message = "purchased successfully" if self.paid else ": payment failed"
#         return f"{self.user} {message} for {product.name} (₹{product.price})"

#     def get_product(self):
#         if self.product_type == "cloth":
#             return Cloth.objects.get(id=self.product_id)
#         return Jewellery.objects.get(id=self.product_id)




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
    STATUS_CHOICES = [
        ("created", "Created"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255)
    product_slug = models.SlugField()
    size = models.CharField(max_length=50, blank=True)
    qty = models.PositiveIntegerField(default=1)
    price = models.FloatField()
    discount = models.FloatField(default=0)
    delivery_charge = models.FloatField(default=0)
    total = models.FloatField()
    razorpay_order_id = models.CharField(max_length=255, blank=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.product_name} - {self.status}"