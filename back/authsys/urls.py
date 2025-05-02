# authsystem/urls.py
from django.urls import path, include, re_path
# from django.views.decorators.csrf import csrf_exempt
# from djoser.views import TokenCreateView
# from djoser.social import urls as social_urls
from .views import redirect_to_frontend

urlpatterns = [
    # 1) Core Djoser (register, activation, reset, users/me, etc.)
    path('', include('djoser.urls')),

    # 2) JWT (login→create, refresh, verify)
    path('', include('djoser.urls.jwt')),

    # 3) Social OAuth flows (e.g. /api/auth/o/google/)
    # path('', include(social_urls)),

    # 4) (Optional) DRF TokenAuth login endpoint
    # path('token/login/', csrf_exempt(TokenCreateView.as_view()), name='token_login'),

    # 5) Activation‑link redirect to SPA
    re_path(
        r'^users/activate/(?P<uid>[\w-]+)/(?P<token>[\w-]+)/$',
        redirect_to_frontend,
        name='activation_redirect'
    ),
]
