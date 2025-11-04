from django.shortcuts import render, redirect
from django.urls import reverse
from django.shortcuts import get_object_or_404, redirect, render
from ..models import Product

from django.views.decorators.cache import never_cache
from django import forms

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        # Specify the fields the user is expected to input.
        # Fields like 'created_at' and calculated fields like 'amount'/'sold_units' 
        # should often be omitted from the input form.
        fields = ['name', 'description', 'brand', 'price', 'part_number', 'vehicles', 'quantity', 'amount', 'sold_units', 'amount_collected']

        # Optional: Add Tailwind CSS classes to fields for better styling
        widgets = {
            'name': forms.TextInput(attrs={'class': 'p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'}),
            # ... add widgets for other fields
        }

@never_cache
def index(request):
    products = Product.objects.all() 
    context ={
        "products":products
    }
    return render(request, "base.html", context)

def product_create(request):
    # Initialize an empty form
    form = ProductForm()

    if request.method == 'POST':
        # If the request is POST, bind the submitted data to the form
        form = ProductForm(request.POST)
        
        if form.is_valid():
            # Save the new Product instance to the database
            form.save()
            
            # Redirect to the product list or a success page
            return redirect(reverse('list_of_products')) 

    # For GET requests or if the form is invalid, render the form
    context = {
        'form': form
    }
    return render(request, "products/create.html", context)


def list_of_products(request):
    products = Product.objects.all()
    context ={
        "products":products
    }
    return render(request, "products/list.html", context)

def low_quantity_products(request):
    return render(request, "dashboard.html", context={})

def product_details(request, pk):
    """
    Renders a detailed view for a single product. 
    Designed to return an HTML fragment for HTMX consumption.
    """
    # Use get_object_or_404 to fetch the product or return a 404 error
    product = get_object_or_404(Product, pk=pk)
    
    context = {
        'product': product,
    }
    # We will use a dedicated template fragment for HTMX
    return render(request, "products/partials/product_details.html", context)


from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

# Use a decorator to ensure only DELETE requests are allowed
@require_http_methods(["DELETE"])
@csrf_exempt
def product_delete(request, pk):
    """
    Deletes a product instance and returns a response suitable for HTMX.
    """
    product = get_object_or_404(Product, pk=pk)
    product_name = product.name
    product.delete()

    # Option 1 (Recommended for HTMX): Return a redirect header. 
    # HTMX understands the 'Location' header and automatically performs the redirect 
    # without needing a full page refresh.
    response = redirect(reverse('list_of_products')) 
    
    # Optional: Send a success message header that HTMX can pick up and display
    # HTMX uses the 'HX-Trigger' header to trigger client-side events.
    response['HX-Trigger'] = '{"productDeleted": true, "message": "Bidhaa ' + product_name + ' imefutwa."}'

    return response

    # Option 2: If the delete button was on the list page (table row), 
    # the HTMX request would simply target and remove the table row, and the view
    # would return an empty 200 response (HttpResponse(status=200)).
    # We'll stick with Option 1 for general use from a details page.

def sales(request):
    return render(request, "dashboard.html", context={})

def sales_create(request):
    return render(request, "dashboard.html", context={})

def sales_list(request):
    return render(request, "dashboard.html", context={})

def sales_details(request):
    return render(request, "dashboard.html", context={})

def sales_delete(request):
    return render(request, "dashboard.html", context={})