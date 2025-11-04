# views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ..serializers import UserSerializer

from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets

from ..serializers import UserSerializer

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import make_password
from ..serializers import UserSerializer  # If you have a custom serializer for User
from rest_framework.authtoken.views import obtain_auth_token

@api_view(['POST'])
def signup(request):
    if request.method == 'POST':
        data = request.data
        
        # Check if user already exists
        if User.objects.filter(username=data['username']).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=data['email']).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=make_password(data['password']),
        )
        user.save()

        # Generate a DRF token for the user
        token, created = Token.objects.get_or_create(user=user)

        # Serialize user data
        serializer = UserSerializer(user)

        # Return user data and token
        return Response({
            "user": serializer.data,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# views.py (add to the same file)
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

from ..serializers import ProductSerializer
from django.views.decorators.cache import cache_page
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from ..models import Product
from ..serializers import ProductSerializer
from django.core.cache import cache

class ProductViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Product instances.
    Provides 'list', 'create', 'retrieve', 'update', 'partial_update', and 'destroy' actions.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Optionally, you can implement filtering or pagination here
        return super().get_queryset()

    # @cache_page(60 * 15)
    def list(self, request, *args, **kwargs):
        # Customize cache key if needed
        cache_key = 'product_list'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, timeout=60 * 15)
        return response

    @cache_page(60 * 15) 
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)





    # Optional: You can add permission classes here to restrict access (e.g., IsAuthenticated)
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]



from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Product
from ..serializers import ProductSerializer
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

class ProductListView(APIView):
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def get(self, request, *args, **kwargs):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetailView(APIView):
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def get(self, request, pk, *args, **kwargs):
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
