from django import forms
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.shortcuts import get_object_or_404, redirect, render
from ..models import Product,Sale, Vehicle
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
    print(products)
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



def product_list(request):
    query = request.GET.get('q', '')
    brand_filter = request.GET.get('brand', '')
    vehicle_filter = request.GET.get('vehicle', '')
    price_min = request.GET.get('price_min', '')
    price_max = request.GET.get('price_max', '')

    products = Product.objects.all().select_related().prefetch_related('vehicles')

    # Search
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(brand__icontains=query) |
            Q(part_number__icontains=query)
        )

    # Brand filter
    if brand_filter:
        products = products.filter(brand__iexact=brand_filter)

    # Vehicle filter
    if vehicle_filter:
        products = products.filter(vehicles__id=vehicle_filter)

    # Price range
    if price_min:
        products = products.filter(price__gte=price_min)
    if price_max:
        products = products.filter(price__lte=price_max)

    # Pagination
    paginator = Paginator(products.distinct(), 10)  # 10 per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'brands': Product.objects.values_list('brand', flat=True).distinct(),
        'vehicles': Vehicle.objects.all(),
        'query': query,
        'brand_filter': brand_filter,
        'vehicle_filter': vehicle_filter,
        'price_min': price_min,
        'price_max': price_max,
    }
    return render(request, 'products/list.html', context)

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


# Assuming 'Product' model and other necessary imports are available

# Define the standard Tailwind CSS classes for your form inputs
STANDARD_INPUT_CLASSES = (
    'w-full rounded-lg border border-gray-300 dark:border-gray-700 '
    'bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 '
    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
)

class UpdateProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'brand', 'price',
            'part_number', 'vehicles', 'quantity',
            'amount', 'sold_units', 'amount_collected'
        ]
        
        # Use a dictionary comprehension to apply the standard class to most fields
        widgets = {
            field: forms.TextInput(attrs={'class': STANDARD_INPUT_CLASSES})
            for field in fields
        }

        # Now, explicitly override the widgets that require different base types 
        # or have additional specific attributes (like 'rows', 'step', or height)
        widgets.update({
            'description': forms.Textarea(attrs={
                'class': STANDARD_INPUT_CLASSES,
                'rows': 4,
            }),
            'price': forms.NumberInput(attrs={
                'class': STANDARD_INPUT_CLASSES,
                'step': '0.01'
            }),
            'vehicles': forms.SelectMultiple(attrs={
                # Add the specific height class to the standard classes
                'class': f'{STANDARD_INPUT_CLASSES} h-32'
            }),
            'quantity': forms.NumberInput(attrs={
                'class': STANDARD_INPUT_CLASSES,
            }),
            'amount': forms.NumberInput(attrs={
                'class': STANDARD_INPUT_CLASSES,
                'step': '0.01'
            }),
            'sold_units': forms.NumberInput(attrs={
                'class': STANDARD_INPUT_CLASSES,
            }),
            'amount_collected': forms.NumberInput(attrs={
                'class': STANDARD_INPUT_CLASSES,
                'step': '0.01'
            }),
            # Correcting base widget types for number fields since the initial 
            # dictionary comprehension defaulted to forms.TextInput
            'name': forms.TextInput(attrs={'class': STANDARD_INPUT_CLASSES}),
            'brand': forms.TextInput(attrs={'class': STANDARD_INPUT_CLASSES}),
            'part_number': forms.TextInput(attrs={'class': STANDARD_INPUT_CLASSES}),
        })

def edit_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = UpdateProductForm(instance=product)

    if request.method == 'POST':
        form = UpdateProductForm(request.POST, instance=product)
        if form.is_valid():
            form.save()
            return redirect(reverse('list_of_products'))

    context = {
        'form': form,
        'product': product
    }
    return render(request, "products/edit.html", context)



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



class SaleForm(forms.ModelForm):
    class Meta:
        model = Sale
        fields = ['product', 'quantity_sold', 'price_per_unit']
        widgets = {
            'product': forms.Select(attrs={
                'class': 'w-full rounded-lg border border-gray-300 dark:border-gray-700 '
                         'bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 '
                         'focus:ring-2 focus:ring-blue-500 focus:outline-none'
            }),
            'quantity_sold': forms.NumberInput(attrs={
                'class': 'w-full rounded-lg border border-gray-300 dark:border-gray-700 '
                         'bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 '
                         'focus:ring-2 focus:ring-blue-500 focus:outline-none'
            }),
            'price_per_unit': forms.NumberInput(attrs={
                'class': 'w-full rounded-lg border border-gray-300 dark:border-gray-700 '
                         'bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 '
                         'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                'step': '0.01'
            }),
        }


def list_sales(request):
    sales = Sale.objects.select_related('product').order_by('-date_sold')
    return render(request, 'sales/list.html', {'sales': sales})


def create_sale(request):
    form = SaleForm()
    if request.method == 'POST':
        form = SaleForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect(reverse('list_sales'))
    return render(request, 'sales/create.html', {'form': form})


def edit_sale(request, pk):
    sale = get_object_or_404(Sale, pk=pk)
    form = SaleForm(instance=sale)
    if request.method == 'POST':
        form = SaleForm(request.POST, instance=sale)
        if form.is_valid():
            form.save()
            return redirect(reverse('list_sales'))
    return render(request, 'sales/edit.html', {'form': form, 'sale': sale})


def delete_sale(request, pk):
    sale = get_object_or_404(Sale, pk=pk)
    if request.method == 'POST':
        sale.delete()
        return redirect(reverse('list_sales'))
    return render(request, 'sales/delete.html', {'sale': sale})



# inventory/views/dashboard.py
from django.shortcuts import render
from django.db.models import Sum, Count

def dashboard(request):
    total_products = Product.objects.count()
    total_sales = Sale.objects.aggregate(total=Sum("total_amount"))["total"] or 0
    total_units_sold = Sale.objects.aggregate(total=Sum("quantity_sold"))["total"] or 0
    total_inventory_value = Product.objects.aggregate(total=Sum("quantity"))["total"] or 0

    recent_sales = Sale.objects.select_related("product").order_by("-date_sold")[:5]

    context = {
        "total_products": total_products,
        "total_sales": total_sales,
        "total_units_sold": total_units_sold,
        "total_inventory_value": total_inventory_value,
        "recent_sales": recent_sales,
    }

    return render(request, "dashboard/index.html", context)
