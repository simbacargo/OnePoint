
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-0*&#!sej456s12n%p+fk(u#*(rpfqrin!8*dqn+lx)56@o9@q&'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = 1

ALLOWED_HOSTS = ["*"]
ALLOWED_SIGNUP_DOMAINS = ["*"]

# Application definition

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'home',
    'authentication',
     'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',  # Google provider
    # 'allauth.socialaccount.providers.apple', # <-- You need this
]

MIDDLEWARE = [
        #        "django.middleware.cache.UpdateCacheMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR/"htmx"],
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

WSGI_APPLICATION = 'server.wsgi.application'
ASGI_APPLICATION = "server.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db3.sqlite3',
        "TEST": {
            "NAME": BASE_DIR / "dbtest.sqlite3",
        },
    }
}
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'onepoint',       
        'USER': 'testuser',       
        'PASSWORD': 'supersecret',
        'HOST': '127.0.0.1',      
        'PORT': '5432',       
            
    }
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


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


REST_FRAMEWORK = {
 'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow any user to access the API
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # JWT Authentication
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10000,

    }
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8081',  # For React app
    'http://127.0.0.1:8081', # For React app (another way to reference localhost)
    'http://localhost:8081',  # For React Native (Expo development server)
    'http://192.168.1.19:8081', # For React Native (Expo development server)
]
CORS_ALLOW_CREDENTIALS = True

APPEND_SLASH=False

# settings.py

# add these below your CACHES setting
#SESSION_ENGINE = "django.contrib.sessions.backends.cache"
#SESSION_CACHE_ALIAS = "default"

CACHESx = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'TIMEOUT': 0,  # 15 minutes default
        'KEY_PREFIX': 'msaidizi',
        'VERSION': 1,
        'OPTIONS': {
            # --- CLIENT & POOLING ---
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {
                'max_connections': 100,
                'retry_on_timeout': True,
            },
            
            # --- SERIALIZATION ---
            # Options: Pickle (Default), JSON, MsgPack (Fastest)
            # 'SERIALIZER': 'django_redis.serializers.msgpack.MsgPackSerializer',
            
            # --- COMPRESSION ---
            # Reduces memory footprint; requires pip install lz4
            'COMPRESSOR': 'django_redis.compressors.lz4.Lz4Compressor',
            
            # --- NETWORKING & TIMEOUTS ---
            'SOCKET_CONNECT_TIMEOUT': 5,  # Seconds to establish connection
            'SOCKET_TIMEOUT': 5,          # Seconds for read/write operations
            
            # --- PRODUCTION RESILIENCE ---
            # If True, Django ignores Redis errors and hits the DB instead (safe for cache)
            'IGNORE_EXCEPTIONS': True,
            'LOG_IGNORED_EXCEPTIONS': True,
        }
    }
}


CACHESx = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': 'django_cacmhe',  # Directory where cache files will be stored
        'TIMEOUT': 0,  # Cache timeout in seconds (15 minutes in this case)
    }
}

import os
STATIC_URL = '/assets/'
STATIC_ROOT = os.path.join(BASE_DIR, "asset")
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "assets"),
]




LOGIN_URL ="/login"
LOGIN_REDIRECT_URL ="/"
LOGOUT_REDIRECT_URL ="/"
CSRF_TRUSTED_ORIGINS = ['http://127.0.0.1:8080',"https://msaidizi.nsaro.com", "https://nsaro.com"]  # Add your frontend domain here


AUTH_USER_MODEL = 'authentication.User'

AUTHENTICATION_BACKENDS = (
    'allauth.account.auth_backends.AuthenticationBackend',  # allauth authentication backend
    'django.contrib.auth.backends.ModelBackend',  # Default backend for local authentication
)

# For allauth, you need to define the SITE_ID, this is the ID of your site in the Django sites framework
SITE_ID = 1


# Use email address as the primary identifier
ACCOUNT_LOGIN_METHOD = 'email'

# Require email verification
# ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']

# Make email unique
ACCOUNT_UNIQUE_EMAIL = True

# Don't require a separate username field during signup for social accounts
# ACCOUNT_USERNAME_REQUIRED = True # Keep this True if you still want users to log in with a username/password, but...
ACCOUNT_USERNAME_VALIDATORS = None # ... you'll need to figure out how to generate the username (see Step 5)

# Redirect URLs after login/logout
LOGIN_REDIRECT_URL = '/' # Or whatever path you want
ACCOUNT_LOGOUT_REDIRECT_URL = '/' # Or whatever path you want


# settings.py
SOCIALACCOUNT_ADAPTER = 'authentication.adapters.CustomSocialAccountAdapter'

# settings.py (or a separate settings_local.py/env file)

# Vodacom M-Pesa Tanzania C2B Push Credentials
MPESA_CONSUMER_KEY = 'YOUR_MPESA_CONSUMER_KEY'
MPESA_CONSUMER_SECRET = 'YOUR_MPESA_CONSUMER_SECRET'
MPESA_SHORTCODE = 'YOUR_BUSINESS_SHORTCODE'  # The PayBill/Lipa number
MPESA_API_INITIATE_URL = 'https://api.vodacom.co.tz/mpesa/v1/c2b-push' # Placeholder URL
MPESA_API_TOKEN_URL = 'https://api.vodacom.co.tz/oauth/v1/token' # Placeholder URL

# Your Publicly Accessible Callback URL (e.g., via Ngrok for testing)
CALLBACK_URL = 'https://your-public-domain.com/api/mpesa/callback/'

# Change this in settings.py
MPESA_API_TOKEN_URL = 'https://openapi.m-pesa.com/sandbox/ipg/v1/token'

# settings.py (Update these URLs)

# The most common base host for M-Pesa Open API
MPESA_BASE_HOST = 'https://openapi.m-pesa.com' 

# 1. AUTHENTICATION URL
MPESA_API_TOKEN_URL = f'{MPESA_BASE_HOST}/sandbox/ipg/v2/vodafoneGHA/getSession/'

# 2. C2B PUSH INITIATION URL
# The singleStage path is common for USSD/STK Push across M-Pesa markets.
MPESA_API_INITIATE_URL = f'{MPESA_BASE_HOST}/sandbox/ipg/v2/vodacomTZN/c2bPayment/singleStage'



CORS_ALLOW_ALL_ORIGINS = True


ALLOWED_HOSTS = ['*']

REST_FRAMEWORK = {
     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'knox.auth.TokenAuthentication',
#         'rest_framework.authentication.SessionAuthentication',
#         'rest_framework.authentication.TokenAuthentication',
#         'rest_framework.authentication.BasicAuthentication',
         'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
     'DEFAULT_PERMISSION_CLASSES': [
         'rest_framework.permissions.AllowAny',
         'rest_framework.permissions.IsAuthenticated',
     ]
} 

INSTALLED_APPS += ['knox']

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "cache-control", # Often missing!
]

from datetime import timedelta
...

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=50),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=50),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "ON_LOGIN_SUCCESS": "rest_framework_simplejwt.serializers.default_on_login_success",
    "ON_LOGIN_FAILED": "rest_framework_simplejwt.serializers.default_on_login_failed",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",

    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=5),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),

    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",

    "CHECK_REVOKE_TOKEN": False,
    "REVOKE_TOKEN_CLAIM": "hash_password",
    "CHECK_USER_IS_ACTIVE": True,
}
