from django.urls import path
from .views import UserDetailView, UserProfileDetailView
urlpatterns = [
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
    path('users/me/profile/', UserProfileDetailView.as_view(), name='user-profile-detail'),
]
