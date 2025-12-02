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


# class Cart(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     product_type = models.CharField(max_length=20,null=True)  # cloth, jewellery
#     product_id = models.PositiveIntegerField(null=True)
#     quantity = models.PositiveIntegerField(default=1)

#     def __str__(self):
#         return f"{self.user} - Cart Item"
    
#     def get_product(self):
#         if self.product_type == "cloth":
#             return Cloth.objects.get(id=self.product_id)
#         return Jewellery.objects.get(id=self.product_id)
    



# class Wishlist(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     product_type = models.CharField(max_length=20,null=True)
#     product_id = models.PositiveIntegerField(null=True)

#     def __str__(self):
#         return f"{self.user} - Wishlist Item"
    
#     def get_product(self):
#         if self.product_type == "cloth":
#             return Cloth.objects.get(id=self.product_id)
#         return Jewellery.objects.get(id=self.product_id)


