from django.contrib import admin
from django.utils.html import format_html
from django.core.exceptions import ValidationError
from .models import Product, ProductVariant
from django.forms.models import BaseInlineFormSet
from django.core.exceptions import ValidationError


class ProductVariantInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()

        product = self.instance

        valid_variants = 0
        variants_missing_price = False

        for form in self.forms:
            if not form.cleaned_data:
                continue

            if form.cleaned_data.get("DELETE"):
                continue

            valid_variants += 1

            # if ANY variant has no price → invalid
            if form.cleaned_data.get("price") is None:
                variants_missing_price = True

        # 🔴 must have at least one variant
        if valid_variants < 1:
            raise ValidationError(
                "At least one product variant is required."
            )

        # 🔴 common_price OR ALL variants must have price
        if product.common_price is None and variants_missing_price:
            raise ValidationError(
                "Set a Common Price or provide a price for ALL variants."
            )


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    formset = ProductVariantInlineFormSet


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline]
    list_display = (
        "id",
        "title",
        "product_image", 
        "variant_sizes",
        "age_category",
        "product_category",
        "is_available",
        "created_at",
    )
    list_display_links = ("title",)

    list_filter = (
        "product_category",
        "age_category",
        "is_available",
        "created_at",
    )

    search_fields = ("title", "slug")

    def product_image(self, obj):
        if obj.image1:
            return format_html(
                '<img src="{}" width="60" height="60" '
                'style="object-fit:cover; border-radius:4px;" />',
                obj.image1.url
            )
        return "—"

    product_image.short_description = "Image"

    def variant_sizes(self, obj):
        sizes = obj.variants.filter(is_active=True).values_list("size", flat=True)
        return ", ".join(sizes) if sizes else "—"

    variant_sizes.short_description = "Sizes"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)

        product = form.instance

        if product.common_price is not None:
            product.variants.filter(price__isnull=True).update(
                price=product.common_price
            )

