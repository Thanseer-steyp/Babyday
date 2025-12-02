from django.urls import path
from api.v1.public.views import (
    ProductListView, ProductDetailView,
    ClothListView, ClothDetailView,
    JewelleryListView, JewelleryDetailView,
)

urlpatterns = [
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<int:id>/", ProductDetailView.as_view(), name="product-detail"),
    
    path("cloth/", ClothListView.as_view(), name="cloth-list"),
    path("cloth/<int:id>/", ClothDetailView.as_view(), name="cloth-detail"),
    
    path("jewellery/", JewelleryListView.as_view(), name="jewellery-list"),
    path("jewellery/<int:id>/", JewelleryDetailView.as_view(), name="jewellery-detail"),
]
