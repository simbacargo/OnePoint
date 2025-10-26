# serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        # Include all fields for full CRUD support
        fields = '__all__' 
        # Alternatively, list the fields you want to expose:
        # fields = ['id', 'name', 'description', 'brand', 'price', 'part_number', 'quantity', 'amount', 'sold_units', 'amount_collected', 'created_at']