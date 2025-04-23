from django.shortcuts import redirect
from django.conf import settings

def redirect_to_frontend(request, uid, token):
    url = f"{settings.FRONTEND_URL}/activate/{uid}/{token}"
    return redirect(url)