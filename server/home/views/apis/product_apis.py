from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from ...models import Product, Sale
from ...serializers import ProductSerializer

# --- HELPERS ---
def get_user_queryset(user):
    """Replicates the logic from your original get_queryset"""
    if user.username in ['nsaro', 'testuser']:
        return Product.objects.all()
    return Product.objects.filter(created_by=user, deleted=False)

# --- VIEWS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_list_view(request):
    print("Received GET request for product list")
    user = request.user

    # Cache Logic
    # cache_key = f'product_list_user__{user.id}'
    # cached_data = cache.get(cache_key)
    # if cached_data:
        # print("Returning cached data")
        # return Response(cached_data)

    queryset = get_user_queryset(user)
    serializer = ProductSerializer(queryset, many=True)
    print(serializer.data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser]) # Only staff can create
def product_create_view(request):
    print("Received POST request to create product")
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        # perform_create logic
        user_business = request.user.businesses.first()
        print("Creating product for business:", user_business)
        serializer.save(business=user_business, created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_retrieve_view(request, pk):
    # Ensure user can only retrieve what they have access to
    queryset = get_user_queryset(request.user)
    product = get_object_or_404(queryset, pk=pk)
    
    serializer = ProductSerializer(product)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser]) # Only staff can update
def product_update_view(request, pk):
    queryset = get_user_queryset(request.user)
    product = get_object_or_404(queryset, pk=pk)
    
    partial = request.method == 'PATCH'
    serializer = ProductSerializer(product, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        # Trigger Sale creation logic here...
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser]) # Only staff can delete
def product_delete_view(request, pk):
    print("Received DELETE request for product with pk:", pk)
    queryset = get_user_queryset(request.user)
    product = get_object_or_404(queryset, pk=pk)
    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


    
    
@api_view(['POST',"PATCH"])
@permission_classes([IsAuthenticated])
def product_sale_view(request, pk):
    user = request.user
    product = get_object_or_404(Product, pk=pk, deleted=False)
    try:
        qty_to_sell = int(request.data.get('quantity_sold', 1))
        # Use provided price or default to product's current price
        price_per_unit = request.data.get('price_per_unit', product.price)
    except (ValueError, TypeError):
        return Response({"error": "Invalid data format."}, status=status.HTTP_400_BAD_REQUEST)

    if qty_to_sell > product.quantity:
        return Response({"error": "Not enough stock available."}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Process Sale
    try:
        with transaction.atomic():
            # Simply create the sale. 
            # The Sale.save() method will automatically call update_stock.
            sale = Sale.objects.create(
                product=product,
                quantity_sold=qty_to_sell,
                price_per_unit=price_per_unit,
                created_by=user
            )
            
            # Refresh product to get updated values from the save() trigger
            product.refresh_from_db()

        return Response({
            "message": "Sale successful",
            "sale_id": sale.id,
            "new_stock": product.quantity,
            "profit_to_date": product.profit
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)