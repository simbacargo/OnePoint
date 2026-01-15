# views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets

from ../../serializers import TransactionSerializer, UserSerializer,SaleSerializer, Sale,CustomerSerializer

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework.authtoken.views import obtain_auth_token
from authentication.models import User
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
from ..models import Customer, Product
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
        return super().get_queryset()

    def list(self, request, *args, **kwargs):
        cache_key = 'product_list'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            print("Serving from cache")
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





from django.shortcuts import render
from django.db.models import Sum, F, Q
from django.core.cache import cache
from django.conf import settings

# Define a cache timeout (e.g., 5 minutes)
SALES_CACHE_TIMEOUT = getattr(settings, 'SALES_CACHE_TIMEOUT', 300)

## 1. Sales Summary View
# Shows key metrics like total revenue and total units sold.
def sales_summary_view(request):
    """
    Displays a high-level summary of all sales activity.
    """
    cache_key = 'sales_summary'
    context = cache.get(cache_key)
    
    if context is None:
        # Calculate overall metrics from the Product model
        sales_data = Product.objects.aggregate(
            total_revenue=Sum('amount_collected'),
            total_units_sold=Sum('sold_units')
        )
        
        # Calculate Total Products in Stock (Quantity - Sold Units)
        total_stock = Product.objects.aggregate(
            total_stock=Sum(F('quantity') - F('sold_units'), 
                            filter=Q(quantity__gt=F('sold_units')))
        )['total_stock'] or 0

        context = {
            'total_revenue': sales_data['total_revenue'] or 0.00,
            'total_units_sold': sales_data['total_units_sold'] or 0,
            'total_stock': total_stock,
            'title': 'Overall Sales Summary',
        }
        
        # Cache the result
        cache.set(cache_key, context, SALES_CACHE_TIMEOUT)

    return render(request, 'sales/sales_summary.html', context)


## 2. Best Selling Products View
# Shows products sorted by the number of units sold.
def best_sellers_view(request):
    """
    Lists products ordered by the number of units sold (descending).
    """
    # Filter for products that have actually been sold
    best_sellers = Product.objects.filter(
        sold_units__gt=0
    ).order_by(
        '-sold_units', '-amount_collected' # Primary sort by units, secondary by revenue
    )[:10] # Top 10 best sellers

    context = {
        'products': best_sellers,
        'title': 'Top 10 Best Sellers',
    }
    return render(request, 'sales/best_sellers.html', context)


## 3. Low Stock Alert View
# Helps management identify products needing re-ordering.
def low_stock_view(request):
    """
    Lists products where remaining stock is below a safety threshold.
    """
    # Define a low-stock threshold (e.g., 5 units)
    LOW_STOCK_THRESHOLD = 5 
    
    low_stock_products = Product.objects.annotate(
        current_stock=F('quantity') - F('sold_units')
    ).filter(
        current_stock__lte=LOW_STOCK_THRESHOLD
    ).order_by(
        'current_stock', 'name'
    )

    context = {
        'products': low_stock_products,
        'threshold': LOW_STOCK_THRESHOLD,
        'title': 'Low Stock Alerts',
    }
    return render(request, 'sales/low_stock.html', context)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers import SaleSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound


class SaleListView(APIView):
    permission_classes = [AllowAny]  # Optional: Only authenticated users can access the API

    # GET method - List all sales
    def get(self, request, *args, **kwargs):
        sales = Sale.objects.select_related('product').order_by('-date_sold')
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    # POST method - Create a new sale
    def post(self, request, *args, **kwargs):
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Transaction recorded successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SaleDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Optional: Only authenticated users can access the API

    # GET method - Retrieve a single sale
    def get(self, request, pk, *args, **kwargs):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            raise NotFound(detail="Sale not found")
        serializer = SaleSerializer(sale)
        return Response(serializer.data)

    # PUT method - Update an existing sale (full update)
    def put(self, request, pk, *args, **kwargs):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            raise NotFound(detail="Sale not found")
        
        serializer = SaleSerializer(sale, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH method - Partially update an existing sale
    def patch(self, request, pk, *args, **kwargs):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            raise NotFound(detail="Sale not found")
        
        serializer = SaleSerializer(sale, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE method - Delete a sale
    def delete(self, request, pk, *args, **kwargs):
        try:
            sale = Sale.objects.get(pk=pk)
        except Sale.DoesNotExist:
            raise NotFound(detail="Sale not found")
        
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
from rest_framework import viewsets

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('product').order_by('-date_sold')
    serializer_class = SaleSerializer



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer