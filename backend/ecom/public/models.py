from django.db import models


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

    mrp = models.DecimalField(max_digits=10, decimal_places=0)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        default=0
    )


    stock_qty = models.PositiveIntegerField()

    image1 = models.ImageField(upload_to='products/', blank=True, null=True)
    image2 = models.ImageField(upload_to='products/', blank=True, null=True)
    image3 = models.ImageField(upload_to='products/', blank=True, null=True)
    image4 = models.ImageField(upload_to='products/', blank=True, null=True)

    material_type = models.CharField(max_length=100, blank=True)
    fit_type = models.CharField(max_length=100, blank=True)
    pattern_design = models.CharField(max_length=100, blank=True)

    available_sizes = models.JSONField(
        default=list,
    )

    age_limits = models.TextField(
        blank=True,
        null=True,
        help_text="Example: Suitable for kids aged 4 to 7 years"
    )


    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
    # Check if slug is empty OR title has changed
        if not self.slug or (self.pk and Product.objects.get(pk=self.pk).title != self.title):
            base_slug = "-".join(self.title.strip().split()).lower()
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
