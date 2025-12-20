from django.urls import path
# from api.v1.user.views import (
#     CreateRazorpayOrderView,
#     VerifyPaymentView,
# )
from .views import ( CartListView, AddToCartView, RemoveFromCartView,UpdateCartQtyView, WishlistListView,
    AddToWishlistView,RemoveFromWishlistView,MeView,AddressView,CreateRazorpayOrderView,VerifyRazorpayPaymentView)

urlpatterns = [
    # path("create-order/", CreateRazorpayOrderView.as_view()),
    # path("verify-payment/", VerifyPaymentView.as_view()),
    path("address/", AddressView.as_view(),name="user-address"),
    path("me/", MeView.as_view(), name="user-data"),
    path("cart/", CartListView.as_view(), name="cart-list"),
    path("cart/add/<slug:slug>/", AddToCartView.as_view(), name="add-to-cart"),
    path("cart/remove/<slug:slug>/", RemoveFromCartView.as_view(), name="remove-from-cart"),
    path("cart/update/<slug:slug>/", UpdateCartQtyView.as_view(), name="update-cart-qty"),  # ✅ ADD
    path("wishlist/", WishlistListView.as_view()),
    path("wishlist/add/<slug:slug>/", AddToWishlistView.as_view()),
    path("wishlist/remove/<slug:slug>/", RemoveFromWishlistView.as_view()),
    path('create-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('verify-payment/', VerifyRazorpayPaymentView.as_view(), name='verify-razorpay-payment'),
]
