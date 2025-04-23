from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class    = UserSerializer
    permission_classes  = [permissions.IsAuthenticated]
    lookup_field        = 'email'
    def get_object(self):
        return self.request.user
