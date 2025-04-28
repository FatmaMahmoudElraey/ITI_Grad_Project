from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Use a more permissive pattern that allows email addresses
    re_path(r'^ws/chat/(?P<username>[^/]+)/$', consumers.ChatConsumer.as_asgi()),
]
