from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TagViewSet,
    ProductViewSet,
    ProductReviewViewSet,
    ProductFlagViewSet,
    LatestProductsViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'latest-products', LatestProductsViewSet, basename='latest-products')
router.register(r'product-reviews', ProductReviewViewSet, basename='product-review')
router.register(r'product-flags', ProductFlagViewSet, basename='product-flag')
urlpatterns = router.urls