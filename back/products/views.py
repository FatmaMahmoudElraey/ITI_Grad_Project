from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers, status
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
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, HttpResponseNotFound
from orders.models import OrderItem
import os

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
        
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        # Check if user has purchased this product
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__payment_status='C'  # Completed orders only
        ).exists()
        
        # Allow product owner (seller) to download their own product
        is_owner = product.seller == user
        
        # Allow admins to download any product
        is_admin = user.is_superuser or user.role == 'admin'
        
        if has_purchased or is_owner or is_admin:
            file_path = product.file.path
            if os.path.exists(file_path):
                # Get the filename from the path
                filename = os.path.basename(file_path)
                response = FileResponse(open(file_path, 'rb'))
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
                return response
            else:
                return HttpResponseNotFound('File not found')
        else:
            return Response(
                {"detail": "You have not purchased this product."},
                status=status.HTTP_403_FORBIDDEN
            )


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




    