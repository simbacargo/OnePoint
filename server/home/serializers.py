# serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


from rest_framework import serializers
from .models import Product, Sale

class ProductSerializer(serializers.ModelSerializer):
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
    # Add a custom field to represent the product name
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'  # Include all the fields from the Sale model
        # Add 'product_name' field explicitly so it is returned along with the other fields
        extra_fields = ['product_name']

    # Optionally, you can exclude the `product` field to avoid returning the `id`
    # or control how the foreign key is displayed.
    # fields = [ ... , 'product_name'] if needed.
