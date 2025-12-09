from rest_framework.viewsets import ModelViewSet
from rest_framework import serializers, status, permissions
from .models import Category, Tag, Product, ProductReview, ProductFlag
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ProductSerializer,
    ProductReviewSerializer,
    ProductFlagSerializer,
)
from .pagination import ProductPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse, HttpResponseNotFound
from orders.models import OrderItem
import os
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

CACHE_TTL = 60 * 5 

@method_decorator(cache_page(CACHE_TTL), name='list')
class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @method_decorator(cache_page(CACHE_TTL), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    @method_decorator(cache_page(CACHE_TTL), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'price']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at']
    pagination_class = ProductPagination

    def get_queryset(self):
        return Product.objects.all().select_related('category', 'seller').prefetch_related('tags', 'reviews', 'flags')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'seller' and not user.is_superuser:
            raise PermissionDenied("Only sellers or admins can create products.")
        
        photo = self.request.data.get('photo')
        serializer.save(seller=user, photo=photo)
        
    def perform_update(self, serializer):
        photo = self.request.data.get('photo')
        if photo:
            serializer.save(photo=photo)
        else:
            serializer.save()
            
        return serializer.instance
        
    def perform_destroy(self, instance):
        try:
            from orders.models import OrderItem
            OrderItem.objects.filter(product=instance).update(product=None)
            
            instance.delete()
        except Exception as e:
            print(f"Error deleting product: {e}")
            raise serializers.ValidationError(f"Unable to delete product: {e}")
            
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__payment_status='C'
        ).exists()
        
        is_owner = product.seller == user
        
        is_admin = user.is_superuser or user.role == 'admin'
        
        if has_purchased or is_owner or is_admin:
            file_path = product.file.path
            if os.path.exists(file_path):
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
        
    @method_decorator(cache_page(CACHE_TTL), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    

    @method_decorator(cache_page(CACHE_TTL), name='featured')
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['patch'])
    def toggle_featured(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        if not user.is_authenticated or (not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only admin users can change featured status.")
            
        product.is_featured = not product.is_featured
        product.save()
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
        
    @action(detail=True, methods=['patch'])
    def toggle_approved(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        if not user.is_authenticated or (not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only admin users can change approval status.")
            
        product.is_approved = not product.is_approved
        product.save()
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def update_photo(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        if not user.is_authenticated or (user != product.seller and not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only the product seller or admin users can update the photo.")
        
        photo = request.FILES.get('photo')
        if not photo:
            return Response({"detail": "No photo provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        product.photo = photo
        product.save()
        
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LatestProductsViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @method_decorator(cache_page(CACHE_TTL), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        return Product.objects.all().select_related('category', 'seller')\
                .prefetch_related('tags', 'reviews', 'flags').order_by('-created_at')[:5]

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