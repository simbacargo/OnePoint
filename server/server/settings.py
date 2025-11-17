
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
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    # 'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.cache.FetchFromCacheMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
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


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db3.sqlite3',
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

    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 1000,

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
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'TIMEOUT': 60 * 15,  # Cache timeout in seconds (15 minutes in this case)
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': BASE_DIR / 'django_cacmhe',  # Directory where cache files will be stored
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
CSRF_TRUSTED_ORIGINS = ['https://msaidizi.nsaro.com']


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