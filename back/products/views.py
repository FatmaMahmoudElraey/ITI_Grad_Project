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
        # Return all products regardless of approval status
        # Frontend will handle filtering based on is_approved where needed
        return Product.objects.all().select_related('category', 'seller').prefetch_related('tags', 'reviews', 'flags')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'seller' and not user.is_superuser:
            raise PermissionDenied("Only sellers or admins can create products.")
        
        # Save the product with the photo from the request
        photo = self.request.data.get('photo')
        serializer.save(seller=user, photo=photo)
        
    def perform_update(self, serializer):
        # Update the photo if provided in the request
        photo = self.request.data.get('photo')
        if photo:
            serializer.save(photo=photo)
        else:
            serializer.save()
            
        return serializer.instance
        
    def perform_destroy(self, instance):
        # Custom deletion logic to handle product deletion
        try:
            # First, handle related OrderItems
            from orders.models import OrderItem
            # Set product to null for all related OrderItems
            OrderItem.objects.filter(product=instance).update(product=None)
            
            # Now delete the product instance
            instance.delete()
        except Exception as e:
            # Log the error for debugging
            print(f"Error deleting product: {e}")
            raise serializers.ValidationError(f"Unable to delete product: {e}")
            
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

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(is_featured=True)[:5] # Get top 5 featured
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['patch'])
    def toggle_featured(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        # Only admin users can toggle featured status
        if not user.is_authenticated or (not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only admin users can change featured status.")
            
        # Toggle the featured status
        product.is_featured = not product.is_featured
        product.save()
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
        
    @action(detail=True, methods=['patch'])
    def toggle_approved(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        # Only admin users can toggle approval status
        if not user.is_authenticated or (not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only admin users can change approval status.")
            
        # Toggle the approval status
        product.is_approved = not product.is_approved
        product.save()
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def update_photo(self, request, pk=None):
        product = self.get_object()
        user = request.user
        
        # Check if the user is the seller or an admin
        if not user.is_authenticated or (user != product.seller and not user.is_superuser and user.role != 'admin'):
            raise PermissionDenied("Only the product seller or admin users can update the photo.")
        
        # Get the photo from the request
        photo = request.FILES.get('photo')
        if not photo:
            return Response({"detail": "No photo provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the product photo
        product.photo = photo
        product.save()
        
        # Return the serialized product
        serializer = self.get_serializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LatestProductsViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Return latest products without filtering by approval status
        # Frontend will handle filtering based on is_approved where needed
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