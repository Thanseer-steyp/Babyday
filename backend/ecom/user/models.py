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