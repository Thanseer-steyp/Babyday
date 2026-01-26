from django.db import models
from django.core.exceptions import ValidationError


class Product(models.Model):

    AGE_CATEGORY_CHOICES = [
        ('kids_boy', 'Kids - Boy'),
        ('kids_girl', 'Kids - Girl'),
        ('kids_unisex', 'Kids - Unisex'),
        ('adults_men', 'Adults - Men'),
        ('adults_women', 'Adults - Women'),
        ('adults_unisex', 'Adults - Unisex'),
        ('all_age_men', 'All Age - Men'),
        ('all_age_women', 'All Age - Women'),
        ('all_age_unisex', 'All Age - Unisex'),
    ]

    PRODUCT_CATEGORY_CHOICES = [
        ('cloth', 'Cloth'),
        ('jewellery', 'Jewellery'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    age_category = models.CharField(
        max_length=20,
        choices=AGE_CATEGORY_CHOICES
    )

    product_category = models.CharField(
        max_length=20,
        choices=PRODUCT_CATEGORY_CHOICES
    )
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=0,
    )

    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0
    )

    image1 = models.ImageField(upload_to='products/', blank=True, null=True)
    image2 = models.ImageField(upload_to='products/', blank=True, null=True)
    image3 = models.ImageField(upload_to='products/', blank=True, null=True)
    image4 = models.ImageField(upload_to='products/', blank=True, null=True)
    material_type = models.CharField(max_length=100, blank=True)
    fit_type = models.CharField(max_length=100, blank=True)
    pattern_design = models.CharField(max_length=100, blank=True)
    age_limits = models.TextField(
        blank=True,
        null=True,
        help_text="Example: Suitable for kids aged 4 to 7 years"
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    common_price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # generate slug ONLY if it doesn't exist
        if not self.slug:
            base_slug = "-".join(self.title.strip().split()).lower()
            slug = base_slug
            counter = 1

            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)
        if not self.is_available:
            self.variants.update(is_active=False)


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )
    size = models.CharField(max_length=10)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        blank=True,
        null=True,
    )
    stock_qty = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'size')

    def clean(self):
        if self.price is not None and self.product:
            if self.price > self.product.mrp:
                raise ValidationError({
                    "price": f"Variant price cannot exceed product MRP ({self.product.mrp})"
                })

    def save(self, *args, **kwargs):
        self.full_clean()  # VERY IMPORTANT
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.title} - {self.size}"
