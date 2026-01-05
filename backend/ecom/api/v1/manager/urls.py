from django.urls import path
from .views import (
    ManageProductView,
    ManageProductDetailView,
    PrepaidPaidOrderListView,
    AllOrdersView
)

urlpatterns = [
    path('products/', ManageProductView.as_view(), name='admin-product-list-create'),
    path('products/<slug:slug>/', ManageProductDetailView.as_view(), name='admin-product-detail'),
    path("all-orders/",AllOrdersView.as_view(),name="manager-all-orders"),
    path("orders/prepaid/paid/",PrepaidPaidOrderListView.as_view(),name="prepaid-paid-orders"),
]
