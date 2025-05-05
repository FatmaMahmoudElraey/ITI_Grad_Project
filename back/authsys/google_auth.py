import requests
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import UserAccount, UserProfile  # Import UserProfile

class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange authorization code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'code': code,
            'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            'redirect_uri': f"{settings.FRONTEND_URL}/google-callback",  # Must match frontend and Google Console
            'grant_type': 'authorization_code'
        }

        token_response = requests.post(token_url, data=data)

        if token_response.status_code != 200:
            return Response({"error": "Failed to obtain access token"},
                           status=status.HTTP_400_BAD_REQUEST)

        token_data = token_response.json()

        # Get user info from Google
        user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        headers = {'Authorization': f"Bearer {token_data['access_token']}"}
        user_info_response = requests.get(user_info_url, headers=headers)

        if user_info_response.status_code != 200:
            return Response({"error": "Failed to get user info"},
                           status=status.HTTP_400_BAD_REQUEST)

        user_info = user_info_response.json()

        # Check if user exists in our database
        try:
            user = UserAccount.objects.get(email=user_info['email'])
        except UserAccount.DoesNotExist:
            # Create a new user
            user = UserAccount.objects.create(
                email=user_info['email'],
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', ''),
                is_active=True,  # Google verified the email already
            )
            # Set a random password since Google handles auth
            user.set_unusable_password()
            user.save()

            # IMPORTANT: Manually create UserProfile
            try:
                UserProfile.objects.create(user=user)
                print(f"Created UserProfile for Google user: {user.email}")
            except Exception as e:
                print(f"Error creating UserProfile: {e}")

        # Ensure the user has a profile (in case it was missed)
        try:
            # First check if profile exists
            if not hasattr(user, 'userprofile'):
                # Create profile explicitly
                from accounts.models import UserProfile
                UserProfile.objects.create(user=user)
                print(f"Created missing profile for {user.email} during Google auth confirmation")
        except Exception as e:
            print(f"Error checking/creating profile: {e}")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        })