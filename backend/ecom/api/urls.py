from django.urls import path
from api.views import SignupView, LoginView, CreateRazorpayOrderView, VerifyPaymentView,ProductListView,ProductDetailView

urlpatterns = [
    path("api/signup/", SignupView.as_view()),
    path("api/login/", LoginView.as_view()),
    path("api/create-order/", CreateRazorpayOrderView.as_view()),
    path("api/verify-payment/", VerifyPaymentView.as_view()),
    path('api/products/', ProductListView.as_view(), name='product-list'),
    path('api/products/<int:id>/', ProductDetailView.as_view(), name='product-detail'),
]
