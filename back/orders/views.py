from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import serializers
from .models import *
from .serializers import (
    CartSerializer, CartItemSerializer,
    OrderSerializer, OrderItemSerializer,
    SubscriptionSerializer, SubscriptionPlanSerializer
)


class CartViewSet(ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartItemViewSet(ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)


class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def perform_create(self, serializer):
        # Log what data is coming in
        print("\n---- ORDER CREATE DATA ----")
        print(f"User: {self.request.user}")
        print(f"Data received: {self.request.data}")

        # Save with user association
        order = serializer.save(user=self.request.user)

        # Log what was actually saved
        print(f"Order created: {order.id}")
        print(f"Shipping address: {order.shipping_address}")
        print(f"Phone: {order.phone}")
        print(f"City: {order.city}")
        print(f"State: {order.state}")
        print(f"Postal Code: {order.postal_code}")
        print(f"Country: {order.country}")

        # Clear the user's cart *after* the order is successfully created.
        try:
            cart = Cart.objects.get(user=self.request.user)
            # Optimization: Use clear() if available, otherwise delete() is fine.
            # cart.items.clear() # Use this if you prefer, but delete() works.
            cart.items.all().delete()
        except Cart.DoesNotExist:
            # Handle case where cart might not exist (though it should if items were added)
            # Consider logging this occurrence for investigation.
            print(f"Warning: Cart not found for user {self.request.user.id} after order creation.")
            pass # Continue even if cart clearing fails

        # No need to return the order explicitly here unless the view framework requires it
        # The default ModelViewSet behavior handles the response generation.


class AdminOrderViewSet(ModelViewSet):
    """
    ViewSet for admin users to manage all orders in the system.
    Only users with admin privileges can access this endpoint.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # Admins can see all orders
        return Order.objects.all().prefetch_related('items', 'user')


class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)

    def perform_create(self, serializer):
        # Ensure the order is set when creating an OrderItem
        order = Order.objects.filter(user=self.request.user).last()  # Get the latest order for the user
        if not order:
            raise serializers.ValidationError("No active order found for the user.")
        serializer.save(order=order)


class SubscriptionPlanViewSet(ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer


class SubscriptionViewSet(ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class SellerOrderViewSet(ModelViewSet):
    """
    ViewSet for sellers to view orders containing their products.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none() # Should not happen due to IsAuthenticated
        # Filter orders that contain at least one product sold by the current user.
        # .distinct() is important to avoid duplicate orders if an order has multiple items from the same seller.
        # .prefetch_related() helps to optimize database queries.
        return Order.objects.filter(items__product__seller=user).distinct().prefetch_related('items', 'items__product', 'user')
