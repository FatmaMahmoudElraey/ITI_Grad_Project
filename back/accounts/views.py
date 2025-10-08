from rest_framework import generics, permissions, viewsets, status, filters
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from django.db.models import Q
from .serializers import UserSerializer, UserProfileSerializer, FavoriteSerializer
from .models import Favorite, UserAccount

User = get_user_model()

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class    = UserSerializer
    permission_classes  = [permissions.IsAuthenticated]
    lookup_field        = 'email'
    def get_object(self):
        return self.request.user

class UserProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.userprofile

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
    
class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        all_users = User.objects.filter(is_active=True).filter(is_staff=False)
        users = all_users.exclude(id=user.id)
        return users

class UsersDetailsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs['pk']
        return User.objects.get(id=user_id)