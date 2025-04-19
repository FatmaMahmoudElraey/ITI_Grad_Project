from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
user = get_user_model()


class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = user
        fields = ('id', 'email', 'name', 'password')#TODO: CHANGE to fname, lname ... etc.



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = user
        fields = ("id", "email", "name")  