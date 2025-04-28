from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from .models import UserAccount, UserProfile, Favorite, ChatMessage
from django.contrib.auth import get_user_model
from orders.serializers import OrderSerializer
from products.serializers import ProductSerializer
from products.models import Product
from orders.models import Order
User = get_user_model()


class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'first_name', 'last_name', 'password', 'role')#TODO: CHANGE to fname, lname ... etc.



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "first_name", "last_name", "is_active", "is_staff", "role")

class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = UserAccount
        fields = ('id', 'email', 'name')

class FavoriteSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'user', 'product')

class UserProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    orders = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ('user', 'bio', 'picture', 'location', 'birth_date', 'orders')

    def get_orders(self, obj):
        orders = Order.objects.filter(user=obj.user)
        return OrderSerializer(orders, many=True).data
    
class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()
    sender_picture = serializers.SerializerMethodField()
    receiver_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = ('id', 'user', 'sender', 'reciever', 'message', 'is_read', 'date', 
                 'sender_name', 'receiver_name', 'sender_picture', 'receiver_picture')
        read_only_fields = ('id', 'date', 'user')
        
    def get_sender_name(self, obj):
        return obj.sender.name if obj.sender else None
        
    def get_receiver_name(self, obj):
        return obj.reciever.name if obj.reciever else None
        
    def get_sender_picture(self, obj):
        try:
            return obj.sender_profile.picture.url if obj.sender_profile.picture else None
        except:
            return None
            
    def get_receiver_picture(self, obj):
        try:
            return obj.reciever_profile.picture.url if obj.reciever_profile.picture else None
        except:
            return None
