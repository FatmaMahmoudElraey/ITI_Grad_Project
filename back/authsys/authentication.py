import logging
from rest_framework_simplejwt.authentication import JWTAuthentication


logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate by reading the access token from an HttpOnly cookie named 'access_token'.

    Falls back to the default Authorization header if the cookie is absent.
    """

    def get_raw_token(self, header):
        """Override to allow token from cookie when header is not provided."""
        # header is the header value from request.META.get('HTTP_AUTHORIZATION')
        request = self.request

        # Try cookie first
        token = request.COOKIES.get('access_token')
        if token:
            return token

        # Fallback to default behavior (Authorization header)
        return super().get_raw_token(header)

    def authenticate(self, request):
        # store request for get_raw_token
        self.request = request

        # Debug logging: show cookies and Authorization header for incoming requests
        try:
            cookies = dict(request.COOKIES)
        except Exception:
            cookies = None

        auth_header = request.META.get('HTTP_AUTHORIZATION')
        logger.debug('CookieJWTAuthentication.authenticate - cookies=%s, Authorization=%s', cookies, auth_header)

        # First, try standard header-based auth (Bearer ...)
        header = self.get_header(request)
        if header is not None:
            try:
                return super().authenticate(request)
            except Exception:
                logger.exception('CookieJWTAuthentication.authenticate - token validation error (Authorization header)')
                raise

        # If no Authorization header, fall back to cookie-based token
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            # No header and no cookie → unauthenticated
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            logger.exception('CookieJWTAuthentication.authenticate - token validation error (cookie)')
            raise
