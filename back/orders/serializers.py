from rest_framework import serializers
from .models import *
from products.models import Product
from accounts.models import UserAccount

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'email', 'name', 'first_name', 'last_name']

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
    user = UserSerializer(read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'payment_status', 'items', 'total',
                 'shipping_address', 'phone', 'city', 'state', 'postal_code', 'country']
        read_only_fields = ['id', 'user', 'created_at', 'total']

    def get_total(self, obj):
        """Calculate the total cost of the order"""
        # Use product price instead of order item price
        # Each product can only be purchased once, so quantity is always 1
        total = sum(item.product.price for item in obj.items.all())
        return total

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])

        # Include all shipping and billing fields
        order = Order.objects.create(**validated_data)

        # Process each item, ensuring each product is only added once
        processed_products = set()
        for item_data in items_data:
            product = item_data['product']

            # Skip if we've already processed this product
            if product.id in processed_products:
                continue

            processed_products.add(product.id)

            # Always set quantity to 1
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=1,
                price=product.price
            )

        return order


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
