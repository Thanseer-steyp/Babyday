from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = (
        ('cloth', 'Cloth'),
        ('jewellery', 'Jewellery'),
    )
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.category})"


class Cloth(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, blank=True, null=True)
    sizes = models.JSONField(default=list, blank=True, null=True)  # e.g., ["S", "M", "L", "XL"]
    colors = models.JSONField(default=list, blank=True, null=True)  # optional

    def __str__(self):
        return f"{self.product.name} - Cloth"


class Jewellery(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)  # optional

    def __str__(self):
        return f"{self.product.name} - Jewellery"
