# views.py
from authentication.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework import permissions, viewsets
from ...serializers import TransactionSerializer, UserSerializer,SaleSerializer, Sale,CustomerSerializer, ProductSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework.decorators import action
from ...models import Customer, Product
from django.core.cache import cache
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import viewsets
from django.shortcuts import render
from django.db.models import Sum, F, Q
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.views.decorators.cache import never_cache
from rest_framework import viewsets, permissions, status


# isAuthenticated = AllowAny

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
    permission_classes = [IsAuthenticated]

# views.py (add to the same file)

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


class IsOwnerOrEmployee(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Employees can do anything
        if request.user.is_staff:
            return True
        # Regular users can only see/edit their own products
        return obj.user == request.user

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        print("Determining permissions for action:", self.action)
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]  # Employees can view
        else:
            permission_classes = [permissions.IsAdminUser]  # Only staff can create/update/delete
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        print("Fetching products for user:", user.username)
        
        if user.username == 'nsaro' or user.username == 'testuser':
            print("User is staff, returning all products")
            return Product.objects.all()
        
        products = Product.objects.filter(
            # business__members=user, 
            created_by=user, 
            deleted=False
        )
        print(products.values("created_by"))  # Debug: Print the actual SQL query being executed
        return products

    def perform_create(self, serializer):
        """
        Automatically associate the product with the user's primary business.
        """
        # Logic: Pick the first business the user is a member of
        user_business = self.request.user.businesses.first()
        serializer.save(business=user_business, created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        # Your custom logic for sales tracking...
        instance = self.get_object()
        # Use partial=True if it's a PATCH request
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Perform the actual update
        self.perform_update(serializer)
        # Trigger your Sale creation logic here
        # Note: Make sure your logic handles 'quantity' changes correctly
        # based on the new stock levels
        return Response(serializer.data)  
    
    def list(self, request, *args, **kwargs):
        print("Received GET request for product list")
        cache_key = f'product_list_user__{request.user.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            print("Returning cached data for user:", request.user.id)
            # return Response(cached_data)
        
        # This super().list() is what actually calls get_queryset()
        response = super().list(request, *args, **kwargs)
        
        # cache.set(cache_key, response.data, timeout=60 * 15)
        return response





class ProductListView(APIView):
    # Change to IsAuthenticated so only logged-in employees see data
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if False:
            products = Product.objects.filter(deleted=False)
        else:
            # 2. Employees only see products for businesses they belong to
            # This follows the Business -> members (User) relationship
            products = Product.objects.filter(
                business__members=user, 
                deleted=False
            ).distinct()

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductDetailView(APIView):
    # Security: Only logged-in members of the business can access this
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user):
        """
        Helper method to ensure users only see products 
        belonging to their businesses.
        """
        if user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(business__members=user, deleted=False).distinct()

    def get(self, request, pk, *args, **kwargs):
        # This replaces .get() and automatically checks permissions
        product = get_object_or_404(self.get_queryset(request.user), pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    def put(self, request, pk, *args, **kwargs):
        # Ensuring they can only update a product they actually own/belong to
        product = get_object_or_404(self.get_queryset(request.user), pk=pk)
        
        # Using partial=True is usually better for APIs so you don't 
        # have to send every single field back in the request body.
        serializer = ProductSerializer(product, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Define a cache timeout (e.g., 5 minutes)
SALES_CACHE_TIMEOUT = getattr(settings, 'SALES_CACHE_TIMEOUT', 300)

## 1. Sales Summary View
# Shows key metrics like total revenue and total units sold.
def sales_summary_view(request):
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
        # cache.set(cache_key, context, SALES_CACHE_TIMEOUT)

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

class SaleListView(APIView):
    permission_classes = [AllowAny]  # Optional: Only authenticated users can access the API

    # GET method - List all sales
    def get(self, request, *args, **kwargs):
        print("Received GET request for sales list")
        sales = Sale.objects.select_related('product').order_by('-date_sold')
        serializer = SaleSerializer(sales, many=True)
        return Response(serializer.data)

    # POST method - Create a new sale
    # @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def post(self, request, *args, **kwargs):
        serializer = TransactionSerializer(data=request.data)
        # serializer = SaleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Transaction recorded successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SaleDetailView(APIView):
    permission_classes = [IsAuthenticated]

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
    
class SaleViewSet(viewsets.ModelViewSet):
    serializer_class = SaleSerializer

    def get_permissions(self):
        """
        Dynamic permissions: Authenticated users can view sales, 
        but only Staff/Admins can modify them.
        """
        print(f"Determining permissions for Sale action: {self.action}")
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """
        Filters sales so users only see records related to their business.
        """
        user = self.request.user
        print(f"Fetching sales for user: {user.username}")

        # Staff can see everything
        if user.username in ['nsaro', 'testuser']:
            print("User is staff or special user, returning all sales")
            return Sale.objects.select_related('product').order_by('-date_sold')

        sales = Sale.objects.filter(
            product__created_by=user
        ).select_related('product').distinct().order_by('-date_sold'
        ) if not (user.username == 'nsaro' or user.username == 'testuser'
                  ) else Sale.objects.select_related('product').order_by('-date_sold')
        
        print(sales.query)  # Debug: Print the actual SQL query being executed

        return sales
    def perform_create(self, serializer):
        """
        Automatically link the sale to the user who processed it.
        """
        serializer.save(processed_by=self.request.user)

    @method_decorator(never_cache)
    def list(self, request, *args, **kwargs):
        print("Received GET request for sales list")
        return super().list(request, *args, **kwargs)

    @method_decorator(never_cache)
    def retrieve(self, request, *args, **kwargs):
        print(f"Received GET request for sale ID: {kwargs.get('pk')}")
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Custom update logic for sales if needed (e.g., adjusting stock).
        """
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        self.perform_update(serializer)
        return Response(serializer.data)    




class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
