from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
load_dotenv()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Add paymob integrations credentials
PAYMOB_API_KEY     = os.getenv("PAYMOB_API_KEY")
PAYMOB_HMAC_KEY    = os.getenv("PAYMOB_HMAC_KEY")
PAYMOB_SECRET_KEY  = os.getenv("PAYMOB_SECRET_KEY")
PAYMOB_PUBLIC_KEY  = os.getenv("PAYMOB_PUBLIC_KEY")
PAYMOB_MERCHANT_ID = os.getenv("PAYMOB_MERCHANT_ID")
PAYMOB_INTEGRATION_ID = os.getenv("PAYMOB_INTEGRATION_ID")
PAYMOB_IFRAME_ID  = os.getenv("PAYMOB_IFRAME_ID")
PAYMOB_AUTH_URL = "https://accept.paymobsolutions.com/api/auth/tokens"
PAYMOB_ORDER_URL = "https://accept.paymobsolutions.com/api/ecommerce/orders"
PAYMOB_PAYMENT_KEY_URL= "https://accept.paymobsolutions.com/api/acceptance/payment_keys"


SECRET_KEY = 'django-insecure-)mx5num+p$9vtlb$+)n5022t7nx#&q57w7u1hqp6t&v4i6pr3y'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG")=='True'
#setting of token time, and headers type
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_filters',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'djoser',
    'corsheaders',
    "channels",
    "debug_toolbar",
    'accounts.apps.AccountsConfig',
    'authsys.apps.AuthsysConfig',
    'products',
    'orders',
    'payments.apps.PaymentsConfig',
    'drf_spectacular',

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

CSRF_TRUSTED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS").split(",")

ASGI_APPLICATION = "webify.asgi.application"

INTERNAL_IPS = [
    "127.0.0.1"
]

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    },
}

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'authsys.authentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    )
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Your Project API',
    'DESCRIPTION': 'Your project description',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

ROOT_URLCONF = 'webify.urls'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': BASE_DIR / 'cache',  # folder to store cached data
    }
}

FRONTEND_URL = os.getenv('FRONTEND_URL')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'accounts' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'webify.wsgi.application'

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

import dj_database_url

DATABASES = {
    "default": dj_database_url.config(
        default=os.getenv("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True
    )
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

DEFAULT_FROM_EMAIL = f"Webify <{os.getenv('EMAIL_HOST_USER')}>"


# Config djoser
SITE_NAME = "Webify"
SITE_DOMAIN = "webify.com"

DJOSER = {
    'USER_ID_FIELD': 'email',
    "LOGIN_FIELD": "email",
    'DOMAIN':SITE_DOMAIN,
    'PASSWORD_RESET_CONFIRM_RETYPE':True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION':True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION':True,
    'SEND_CONFIRMATION_EMAIL':True,
    'SET_USERNAME_RETYPE':True,
    'SET_PASSWORD_RETYPE':True,
    'PASSWORD_RESET_CONFIRM_URL':'password/reset/confirm/{uid}/{token}',
    'USERNAME_RESET_CONFIRM_URL':'email/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL':'users/activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL':True,
    'SITE_NAME': SITE_NAME,
        'SERIALIZERS': {
        'user_create':  'accounts.serializers.UserCreateSerializer',
        'user':         'accounts.serializers.UserSerializer',
        'current_user': 'accounts.serializers.UserSerializer',
    },
    'EMAIL': {
        'activation': 'accounts.email.CustomActivationEmail',
        'password_reset': 'accounts.email.CustomPasswordResetEmail',
    },

    'PERMISSIONS': {
        'activation': ['rest_framework.permissions.AllowAny'],
        'password_reset': ['rest_framework.permissions.AllowAny'],
        'password_reset_confirm': ['rest_framework.permissions.AllowAny'],
        'set_password': ['djoser.permissions.CurrentUserOrAdmin'],
        'username_reset': ['rest_framework.permissions.AllowAny'],
        'username_reset_confirm': ['rest_framework.permissions.AllowAny'],
        'set_username': ['djoser.permissions.CurrentUserOrAdmin'],
        'user_create': ['rest_framework.permissions.AllowAny'],
        'user_delete': ['djoser.permissions.CurrentUserOrAdmin'],
        'user': ['djoser.permissions.CurrentUserOrAdmin'],
        'user_list': ['djoser.permissions.CurrentUserOrAdmin'],
        'token_create': ['rest_framework.permissions.AllowAny'],
        'token_destroy': ['rest_framework.permissions.IsAuthenticated'],
    },
}

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Optional but recommended
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.UserAccount'
#for prod :
BASE_APP_URL = os.getenv('BASE_APP_URL') #"http://localhost:5173"
BASE_API_URL = os.getenv('BASE_API_URL') #"http://localhost:8000"
GOOGLE_OAUTH2_CLIENT_ID = os.getenv("GOOGLE_OAUTH2_CLIENT_ID")
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH2_CLIENT_SECRET")
#for dev :
# BASE_APP_URL = "http://localhost:5173"
# BASE_API_URL = "http://localhost:8000"
# GOOGLE_OAUTH2_CLIENT_ID = os.getenv("GOOGLE_OAUTH2_CLIENT_ID")
# GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH2_CLIENT_SECRET")
