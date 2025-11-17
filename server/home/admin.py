from django.contrib import admin
from .models import Product

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'price', 'part_number', 'quantity', 'deleted')
    search_fields = ('name', 'brand', 'part_number')
    list_filter = ('brand', 'deleted')
    ordering = ('name',)
    
admin.site.register(Product, ProductAdmin)