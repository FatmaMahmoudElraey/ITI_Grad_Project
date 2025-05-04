from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'chat-messages', ChatMessageViewSet, basename='chat-messages')

urlpatterns = [
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('users/me/profile/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('customers/', UserListView.as_view(), name='user-list'),
    path('customers/<int:pk>/', UsersDetailsView.as_view(), name='user-detail'),
    path('', include(router.urls)),
]
