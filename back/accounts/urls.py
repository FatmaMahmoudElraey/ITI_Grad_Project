from django.urls import path
from .views import UserDetailView
urlpatterns = [
    path('users/me/', UserDetailView.as_view(), name='user-detail'),
]
