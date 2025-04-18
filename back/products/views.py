from rest_framework.viewsets import ModelViewSet
from .models import Category, Tag, Product, ProductReview, ProductFlag
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ProductSerializer,
    ProductReviewSerializer,
    ProductFlagSerializer,
)


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

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
        serializer.save(user=self.request.user)


