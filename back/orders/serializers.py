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
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'created_at', 'payment_status', 'items', 'total']
        read_only_fields = ['user', 'created_at', 'total']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        total_order_cost = 0
        for item_data in items_data:
            product = item_data['product'] # Get product instance from OrderItemSerializer
            quantity = item_data['quantity']
            price = product.price # Get price from the product instance
            order_item = OrderItem.objects.create(
                order=order, 
                product=product,
                quantity=quantity,
                price=price # Store the price at the time of order
            )
            total_order_cost += (price * quantity)
        
        # Save the calculated total to the order
        order.total = total_order_cost
        order.save()
        
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
