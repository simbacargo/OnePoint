from django.contrib import admin
from .models import Product, Vehicle, Sale, Customer,Business

admin.site.register(Vehicle)
admin.site.register(Sale)
admin.site.register(Customer)
admin.site.register(Business)

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'price', 'part_number', 'quantity', 'deleted')
    search_fields = ('name', 'created_by', 'part_number')
    list_filter = ('created_by', 'deleted')
    ordering = ('name',)
    
admin.site.register(Product, ProductAdmin)
