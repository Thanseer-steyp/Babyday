from django.urls import path
from .views import (
    ManageProductView,
    ManageProductDetailView
)

urlpatterns = [
    path('products/', ManageProductView.as_view(), name='admin-product-list-create'),
    path('products/<slug:slug>/', ManageProductDetailView.as_view(), name='admin-product-detail'),
]
