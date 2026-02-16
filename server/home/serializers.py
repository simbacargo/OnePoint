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
    product_name = serializers.CharField(source='product.name', read_only=True)
    part_number = serializers.CharField(source='product.part_number', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'  # Include all the fields from the Sale model
        extra_fields = ['product_name', 'part_number']


class SaleItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Sale
        fields = ['product', 'quantity_sold', 'price_per_unit']

    # We need to make sure price_per_unit is treated as a decimal correctly
    price_per_unit = serializers.DecimalField(max_digits=12, decimal_places=2)
    
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

    
from rest_framework import serializers
from django.db import transaction
class SaleItemSerializer(serializers.ModelSerializer):
    quantity_sold = serializers.IntegerField()
    price_per_unit = serializers.DecimalField(max_digits=12, decimal_places=2)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Sale
        fields = ['product', 'quantity_sold', 'price_per_unit']
    
class TransactionSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = serializers.DateTimeField()
    items = SaleItemSerializer(many=True)
    
    
    def create(self, validated_data):
        # Get request from context passed by the View
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        
        print("--- DEBUG ---")
        print(f"User making the sale: {user}") 
        print("--- --- ---")

        items_data = validated_data.pop('items')
        customer_name = validated_data.pop('customer_name')
        total_amount = validated_data.get('total_amount')
        
        with transaction.atomic():
            customer = None
            if customer_name.lower() != "walking customer":
                customer, created = Customer.objects.get_or_create(name=customer_name)
                # Use Decimal math directly since total_amount is a DecimalField
                customer.remaining_balance += total_amount
                customer.save()

            created_sales = []
            for item in items_data:
                # We assign 'user' to the 'created_by' field defined in your Model
                sale = Sale.objects.create(
                    created_by=user, 
                    customer=customer,
                    product=item['product'],
                    quantity_sold=item['quantity_sold'],
                    price_per_unit=item['price_per_unit']
                    # total_amount is calculated in Sale.save() automatically
                )
                created_sales.append(sale)
                
                # Note: Your Sale.save() already calls self.product.update_stock.
                # If update_stock handles quantity deduction, you don't need 
                # to manually subtract it here.
                
        return {
            "customer_name": customer_name,
            "total_amount": total_amount,
            "transaction_date": validated_data.get('transaction_date'),
            "items": created_sales
        }
        
        
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'