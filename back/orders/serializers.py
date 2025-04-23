from rest_framework import serializers
from .models import *
from products.models import Product

class ProductLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'price']


# -------------------
# Cart + CartItem
# -------------------

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductLiteSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items']
        read_only_fields = ['user']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductLiteSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity']
        read_only_fields = ['price']

    def create(self, validated_data):
        product = validated_data['product']
        validated_data['price'] = product.price  
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'product' in validated_data:
            product = validated_data['product']
            validated_data['price'] = product.price  
        return super().update(instance, validated_data)

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'payment_status', 'items']
        read_only_fields = ['user']
    
    


# -------------------
# Subscriptions
# -------------------

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'description', 'price', 'duration_days', 'is_active']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'start_date', 'end_date', 'is_active']
