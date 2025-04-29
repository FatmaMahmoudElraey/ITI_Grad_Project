from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
import jwt
from django.conf import settings
import urllib.parse
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"User with ID {user_id} not found")
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Get token from query string
        token = None
        query_string = scope.get('query_string', b'').decode()
        
        logger.info(f"WebSocket connection attempt with query string: {query_string}")
        
        if query_string:
            # Parse the query string
            try:
                query_params = dict(urllib.parse.parse_qsl(query_string))
                token = query_params.get('token')
                logger.info(f"Token found in query string: {token[:10]}..." if token else "No token in query params")
            except Exception as e:
                logger.error(f"Error parsing query string: {str(e)}")
        
        # Default anonymous user
        scope['user'] = AnonymousUser()
        
        if token:
            try:
                # Decode the JWT token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=['HS256']
                )
                user_id = payload.get('user_id')
                logger.info(f"Decoded JWT token with user_id: {user_id}")
                
                if user_id:
                    scope['user'] = await get_user(user_id)
                    logger.info(f"Authenticated WebSocket user: {scope['user'].email if not scope['user'].is_anonymous else 'Anonymous'}")
            except Exception as e:
                logger.error(f"JWT Authentication error: {str(e)}")
        else:
            logger.warning("No token provided in WebSocket connection")
        
        return await self.inner(scope, receive, send)
