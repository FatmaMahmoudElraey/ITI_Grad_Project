from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers
from .models import Category, Tag, Product, ProductReview, ProductFlag
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ProductSerializer,
    ProductReviewSerializer,
    ProductFlagSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.exceptions import PermissionDenied

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'price']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        return Product.objects.filter(is_approved=True).select_related('category', 'seller').prefetch_related('tags', 'reviews', 'flags', 'images')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'seller' and not user.is_superuser:
            raise PermissionDenied("Only sellers or admins can create products.")
        serializer.save(seller=user)


class ProductReviewViewSet(ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    

class ProductFlagViewSet(ModelViewSet):
    queryset = ProductFlag.objects.all()
    serializer_class = ProductFlagSerializer

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        if ProductFlag.objects.filter(user=self.request.user, product=product).exists():
            raise serializers.ValidationError("You have already flagged this product.")
        serializer.save(user=self.request.user)




    