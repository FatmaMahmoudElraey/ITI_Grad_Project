from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from .models import UserAccount, UserProfile
from django.contrib.auth import get_user_model
from orders.serializers import OrderSerializer
from orders.models import Order
User = get_user_model()


class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'password')#TODO: CHANGE to fname, lname ... etc.



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name")

class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = UserAccount
        fields = ('id', 'email', 'name')


class UserProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    orders = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ('user', 'bio', 'picture', 'location', 'birth_date', 'orders')

    def get_orders(self, obj):
        orders = Order.objects.filter(user=obj.user)
        return OrderSerializer(orders, many=True).data
    

