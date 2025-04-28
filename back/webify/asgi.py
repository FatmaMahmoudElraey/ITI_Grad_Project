import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webify.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import accounts.routing
from accounts.middleware import JWTAuthMiddleware

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            accounts.routing.websocket_urlpatterns
        )
    ),
})
