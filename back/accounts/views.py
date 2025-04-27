from rest_framework import generics, permissions, viewsets
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer
from .models import UserProfile

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
    