from django.db import models


SIZE_CHOICES = [
    ('S', 'Small'), ('M', 'Medium'), ('L', 'Large'), ('FREE', 'Free Size'),
    ('0-1', '0-1'), ('1-2', '1-2'), ('2-3', '2-3'), ('3-4', '3-4'),
    ('4-5', '4-5'), ('5-6', '5-6'), ('6-7', '6-7'), ('7-8', '7-8'),
    ('8-9', '8-9'), ('9-10', '9-10'), ('10-11', '10-11'), ('11-12', '11-12'),
    ('12-13', '12-13'), ('13-14', '13-14'), ('14-15', '14-15'),
]

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
        help_text="Available sizes (choose from): " + ", ".join([label for value, label in SIZE_CHOICES])
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
