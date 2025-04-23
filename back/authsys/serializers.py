from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from djoser.serializers import UserCreateSerializer, CurrentUserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class JWTSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

class AuthUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model  = User
        fields = ['id','email','name','password']

class AuthCurrentUserSerializer(CurrentUserSerializer):
    class Meta(CurrentUserSerializer.Meta):
        model  = User
        fields = ['id','email','name','is_active']

"""This to Override token payloads or add extra claims if needed"""