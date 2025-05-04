from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Tag, Product, ProductReview, ProductFlag

User = get_user_model()

class UserPublicSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='get_full_name', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ProductReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']


class ProductFlagSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ProductFlag
        fields = ['id', 'user', 'reason', 'created_at']
        read_only_fields = ['user', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    seller = UserPublicSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags_names = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='name', source='tags'
    )
    reviews = ProductReviewSerializer(many=True, read_only=True)
    flags = ProductFlagSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'title', 'description', 'category', 'category_name', 'tags_names',
            'file', 'preview_video', 'photo', 'live_demo_url',
            'price', 'is_in_subscription', 'is_approved', 'is_featured',
            'created_at', 'reviews', 'flags'
        ]
