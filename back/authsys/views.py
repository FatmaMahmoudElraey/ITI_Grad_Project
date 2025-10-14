from django.shortcuts import redirect
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView


def redirect_to_frontend(request, uid, token):
    url = f"{settings.FRONTEND_URL}/activate/{uid}/{token}"
    return redirect(url)


class CookieTokenObtainPairView(TokenObtainPairView):
    """Obtain JWT pair and set them as HttpOnly cookies on response."""

    def finalize_response(self, request, response, *args, **kwargs):
        # TokenObtainPairView returns {'access':..., 'refresh':...} in response.data
        access = response.data.get('access')
        refresh = response.data.get('refresh')

        if access:
            # Set access token cookie
            response.set_cookie(
                key='access_token',
                value=access,
                httponly=True,
                # In local development (DEBUG=True) use SameSite='Lax' and secure=False.
                # In production, use SameSite=None with Secure=True for cross-site cookies.
                secure=True,
                samesite=('Lax' if settings.DEBUG else 'None'),
                path='/',
                domain=None
            )

        if refresh:
            # Set refresh token cookie
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                secure=True,
                samesite=('Lax' if settings.DEBUG else 'None'),
                path='/',
                domain=None  
            )

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    """Refresh access token and update access cookie. Optionally rotate refresh."""

    def post(self, request, *args, **kwargs):
        # Try to get refresh token from cookie if not provided in body
        refresh_token = request.COOKIES.get('refresh_token')
        data = request.data.copy()
        if 'refresh' not in data and refresh_token:
            data['refresh'] = refresh_token

        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            return Response({'detail': 'Token is invalid or expired.'}, status=status.HTTP_401_UNAUTHORIZED)

        access = serializer.validated_data.get('access')
        refresh = serializer.validated_data.get('refresh')

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)

        if access:
            response.set_cookie(
                key='access_token',
                value=access,
                httponly=True,
                secure=True,
                samesite=('Lax' if settings.DEBUG else 'None'),
                path='/',
                domain=None  
            )

        # If refresh rotation enabled, update refresh cookie as well
        if refresh:
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                secure=True,
                samesite=('Lax' if settings.DEBUG else 'None'),
                path='/',
                domain=None  
            )

        return response


class LogoutView(APIView):
    """Logout by blacklisting refresh token (if present) and clearing cookies."""

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')

        # Try to blacklist the refresh token if possible
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # token invalid or blacklisting not configured
                pass

        response = Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)

        # Delete cookies
        response.delete_cookie('access_token', path='/')
        response.delete_cookie('refresh_token', path='/')

        return response