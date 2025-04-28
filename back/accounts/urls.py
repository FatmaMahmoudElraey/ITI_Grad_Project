from django.urls import path
from .views import UserDetailView, UserProfileDetailView
from rest_framework.routers import DefaultRouter
from .views import FavoriteViewSet

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('users/me/profile/', UserProfileDetailView.as_view(), name='user-profile-detail'),
]+ router.urls
