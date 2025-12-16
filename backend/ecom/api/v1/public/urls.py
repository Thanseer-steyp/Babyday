from django.urls import path
from .views import ProductView,ProductDetailView

urlpatterns = [
    path('products/', ProductView.as_view(), name='product-operations'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail-operations'),
]
