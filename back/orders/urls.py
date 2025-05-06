from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CartViewSet, CartItemViewSet,
    OrderViewSet, OrderItemViewSet,
    SubscriptionViewSet, SubscriptionPlanViewSet,
    AdminOrderViewSet,
    SellerOrderViewSet
)

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'seller-orders', SellerOrderViewSet, basename='seller-order')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')
router.register(r'order-items', OrderItemViewSet, basename='order-item')
router.register(r'subscription-plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = router.urls
