from rest_framework import generics, permissions, viewsets, status, filters
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from django.db.models import Q
from .serializers import UserSerializer, UserProfileSerializer, FavoriteSerializer, ChatMessageSerializer
from .models import Favorite, ChatMessage, UserAccount

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

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-date']
    
    def get_queryset(self):
        user = self.request.user
        # Get the other user's email from the query parameters
        other_user_email = self.request.query_params.get('email', None)
        
        if other_user_email:
            try:
                other_user = UserAccount.objects.get(email=other_user_email)
                # Get messages between the current user and the other user
                messages = ChatMessage.objects.filter(
                    (Q(sender=user) & Q(reciever=other_user)) | 
                    (Q(sender=other_user) & Q(reciever=user))
                ).order_by('date')
                
                # Debug logging
                print(f"Found {messages.count()} messages between {user.email} and {other_user_email}")
                for msg in messages:
                    print(f"  - From {msg.sender.email} to {msg.reciever.email}: {msg.message[:30]}...")
                
                return messages
            except UserAccount.DoesNotExist:
                print(f"User not found: {other_user_email}")
                return ChatMessage.objects.none()
        
        # If no other user specified, return all messages for the current user
        return ChatMessage.objects.filter(
            Q(sender=user) | Q(reciever=user)
        ).order_by('date')
    
    def perform_create(self, serializer):
        other_user_email = self.request.data.get('reciever_email', None)
        if not other_user_email:
            return Response(
                {"error": "Receiver email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = UserAccount.objects.get(email=other_user_email)
            serializer.save(
                user=self.request.user,
                sender=self.request.user,
                reciever=other_user
            )
        except UserAccount.DoesNotExist:
            return Response(
                {"error": "Receiver not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

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