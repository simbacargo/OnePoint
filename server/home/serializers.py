# serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

from rest_framework import serializers
from django.db import transaction
from .models import Sale, Product, Customer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


from rest_framework import serializers
from .models import Product, Sale

class ProductSerializer(serializers.ModelSerializer):
    vehicle_list = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
        source='vehicles'
    )
    class Meta:
        model = Product
        # Include all fields for full CRUD support
        fields = '__all__' 
        # Alternatively, list the fields you want to expose:
        # fields = ['id', 'name', 'description', 'brand', 'price', 'part_number', 'quantity', 'amount', 'sold_units', 'amount_collected', 'created_at']


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'  # Include all the fields from the Sale model
        extra_fields = ['product_name']


class SaleItemSerializer(serializers.ModelSerializer):
    # This maps to the "items" array in your JSON
    class Meta:
        model = Sale
        fields = ['product', 'quantity_sold', 'price_per_unit']

class TransactionSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = serializers.DateTimeField()
    items = SaleItemSerializer(many=True)

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer_name = validated_data.pop('customer_name')
        # Keep total_amount and transaction_date to return them later
        total_amount = validated_data.get('total_amount')
        transaction_date = validated_data.get('transaction_date')
        
        with transaction.atomic():
            created_sales = []
            for item in items_data:
                # 1. Create the Sale
                sale = Sale.objects.create(**item)
                created_sales.append(sale)
                
                # 2. Link to Customer
                Customer.objects.get_or_create(
                    name=customer_name,
                    defaults={'email': f"{customer_name.lower().replace(' ', '_')}@example.com"},
                    sale=sale 
                )
        
        # IMPORTANT: Return a dictionary that matches ALL fields 
        # defined at the top of this serializer class.
        return {
            "customer_name": customer_name,
            "total_amount": total_amount,
            "transaction_date": transaction_date,
            "items": created_sales
        }
    
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'