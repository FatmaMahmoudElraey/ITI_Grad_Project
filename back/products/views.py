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


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related('category', 'seller').prefetch_related('tags', 'reviews', 'flags', 'images')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'price']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

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




    