from django.contrib import admin
from .models import Product, Vehicle, Sale, Customer,Business

admin.site.register(Vehicle)
admin.site.register(Customer)
admin.site.register(Business)

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'price', 'part_number', 'quantity', 'deleted')
    search_fields = ('name', 'created_by', 'part_number')
    list_filter = ('created_by', 'deleted')
    ordering = ('name',)
    

class SaleAdmin(admin.ModelAdmin):
    list_display = ( 'quantity_sold', 'date_sold', 'aproved')
    list_display = ('product', 'quantity_sold', 'created_by','date_sold', 'customer', 'aproved')
    search_fields = ( 'quantity_sold', 'date_sold', 'aproved')
    list_filter = ( 'quantity_sold', 'date_sold', 'aproved')
    ordering = ( 'quantity_sold', 'date_sold', 'aproved')
    list_editable = ("quantity_sold", "created_by", "aproved")
    
admin.site.register(Product, ProductAdmin)
admin.site.register(Sale, SaleAdmin)
