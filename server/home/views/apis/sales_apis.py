from django.views.decorators.cache import cache_control
from rest_framework.decorators import api_view
from rest_framework.response import Response
from home.models import Sale
from home.serializers import SaleSerializer
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from django.db.models import Count,Avg, Max, Min# SALES APIS

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def list_unverified_sales_api(request):
    sales = Sale.objects.select_related('product').filter(aproved=False,product__created_by=request.user).order_by('-date_sold')
    print(sales)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['POST'])
def approve_sale_api(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
        sale.aproved = True
        sale.save()
        return Response({'status': 'success', 'message': 'Sale approved successfully.'})
    except Sale.DoesNotExist:
        return Response({'status': 'error', 'message': 'Sale not found.'}, status=404)
    

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['POST'])
def reject_sale_api(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
        sale.rejected = True
        sale.save()
        return Response({'status': 'success', 'message': 'Sale rejected and deleted successfully.'})
    except Sale.DoesNotExist:
        return Response({'status': 'error', 'message': 'Sale not found.'}, status=404)
    
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def list_approved_sales_api(request):
    sales = Sale.objects.select_related('product').filter(aproved=True,product__created_by=request.user).order_by('-date_sold')
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def list_rejected_sales_api(request):
    sales = Sale.objects.select_related('product').filter(rejected=True).order_by('-date_sold')
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def list_all_sales_api(request):
    sales = Sale.objects.select_related('product').filter(product__created_by=request.user).order_by('-date_sold')
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sale_details_api(request, pk):
    try:
        sale = Sale.objects.select_related('product').get(pk=pk)
        serializer = SaleSerializer(sale)
        return Response(serializer.data)
    except Sale.DoesNotExist:
        return Response({'status': 'error', 'message': 'Sale not found.'}, status=404)
    
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_summary_api(request):
    total_sales = Sale.objects.filter(aproved=True,product__created_by=request.user).count()
    total_revenue = Sale.objects.filter(aproved=True,product__created_by=request.user).aggregate(total=models.Sum('total_amount'))['total'] or 0
    total_products_sold = Sale.objects.filter(aproved=True,product__created_by=request.user).aggregate(total=models.Sum('quantity_sold'))['total'] or 0

    summary = {
        'total_sales': total_sales,
        'total_revenue': total_revenue,
        'total_products_sold': total_products_sold,
    }
    return Response(summary)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_product_sales_api(request, product_id):
    sales = Sale.objects.select_related('product').filter(product__id=product_id, aproved=True,product__created_by=request.user).order_by('-date_sold')
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_daily_sales_api(request):

    today = timezone.now().date()
    start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
    end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))

    sales = Sale.objects.select_related('product').filter(date_sold__range=(start_of_day, end_of_day), aproved=True)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_monthly_sales_api(request):

    today = timezone.now().date()
    start_of_month = timezone.make_aware(timezone.datetime.combine(today.replace(day=1), timezone.datetime.min.time()))
    if today.month == 12:
        end_of_month = timezone.make_aware(timezone.datetime.combine(today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1), timezone.datetime.max.time()))
    else:
        end_of_month = timezone.make_aware(timezone.datetime.combine(today.replace(month=today.month + 1, day=1) - timedelta(days=1), timezone.datetime.max.time()))

    sales = Sale.objects.select_related('product').filter(date_sold__range=(start_of_month, end_of_month), aproved=True)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_yearly_sales_api(request):

    today = timezone.now().date()
    start_of_year = timezone.make_aware(timezone.datetime.combine(today.replace(month=1, day=1), timezone.datetime.min.time()))
    end_of_year = timezone.make_aware(timezone.datetime.combine(today.replace(month=12, day=31), timezone.datetime.max.time()))

    sales = Sale.objects.select_related('product').filter(date_sold__range=(start_of_year, end_of_year), aproved=True)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_by_date_range_api(request, start_date, end_date):

    start_date = timezone.make_aware(timezone.datetime.strptime(start_date, '%Y-%m-%d'))
    end_date = timezone.make_aware(timezone.datetime.strptime(end_date, '%Y-%m-%d') + timezone.timedelta(days=1) - timezone.timedelta(seconds=1))

    sales = Sale.objects.select_related('product').filter(date_sold__range=(start_date, end_date), aproved=True)
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_top_selling_products_api(request, top_n=5):

    top_products = (Sale.objects.filter(aproved=True)
                    .values('product__id', 'product__name')
                    .annotate(total_sold=Sum('quantity_sold'))
                    .order_by('-total_sold')[:top_n])

    return Response(top_products)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_statistics_api(request):

    stats = Sale.objects.filter(aproved=True).aggregate(
        average_sale_amount=Avg('total_amount'),
        max_sale_amount=Max('total_amount'),
        min_sale_amount=Min('total_amount'),
    )

    return Response(stats)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_pending_sales_count_api(request):
    pending_count = Sale.objects.filter(aproved=False).count()
    return Response({'pending_sales_count': pending_count}) 

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_approved_sales_count_api(request):
    approved_count = Sale.objects.filter(aproved=True).count()
    return Response({'approved_sales_count': approved_count})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_rejected_sales_count_api(request):
    rejected_count = Sale.objects.filter(rejected=True).count()
    return Response({'rejected_sales_count': rejected_count})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_total_revenue_api(request):
    total_revenue = Sale.objects.filter(aproved=True).aggregate(total=models.Sum('total_amount'))['total'] or 0
    return Response({'total_revenue': total_revenue})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_total_products_sold_api(request):
    total_products_sold = Sale.objects.filter(aproved=True).aggregate(total=models.Sum('quantity_sold'))['total'] or 0
    return Response({'total_products_sold': total_products_sold})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_average_sale_value_api(request):

    average_sale_value = Sale.objects.filter(aproved=True).aggregate(average=models.Avg('total_amount'))['average'] or 0
    return Response({'average_sale_value': average_sale_value})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_highest_sale_api(request):

    highest_sale = Sale.objects.filter(aproved=True).aggregate(highest=models.Max('total_amount'))['highest'] or 0
    return Response({'highest_sale': highest_sale})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_lowest_sale_api(request):

    lowest_sale = Sale.objects.filter(aproved=True).aggregate(lowest=models.Min('total_amount'))['lowest'] or 0
    return Response({'lowest_sale': lowest_sale})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_trends_api(request):
    today = timezone.now().date()
    start_date = today - timedelta(days=30)

    sales_trends = (Sale.objects.filter(date_sold__date__gte=start_date, aproved=True)
                    .extra({'date': "date(date_sold)"})
                    .values('date')
                    .annotate(total_sales=Count('id'))
                    .order_by('date'))

    return Response(sales_trends)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_product_sales_summary_api(request, product_id):

    total_sold = Sale.objects.filter(product__id=product_id, aproved=True).aggregate(total=models.Sum('quantity_sold'))['total'] or 0
    total_revenue = Sale.objects.filter(product__id=product_id, aproved=True).aggregate(total=models.Sum('total_amount'))['total'] or 0

    summary = {
        'product_id': product_id,
        'total_sold': total_sold,
        'total_revenue': total_revenue,
    }
    return Response(summary)    

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_recent_sales_api(request, limit=10):
    sales = Sale.objects.select_related('product').filter(aproved=True).order_by('-date_sold')[:limit]
    serializer = SaleSerializer(sales, many=True)
    return Response(serializer.data)

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_count_api(request):
    sales_count = Sale.objects.filter(aproved=True).count()
    return Response({'sales_count': sales_count})

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_total_sales_amount_api(request):
    total_sales_amount = Sale.objects.filter(aproved=True).aggregate(total=models.Sum('total_amount'))['total'] or 0
    return Response({'total_sales_amount': total_sales_amount})


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_average_units_sold_per_sale_api(request):

    average_units_sold = Sale.objects.filter(aproved=True).aggregate(average=models.Avg('quantity_sold'))['average'] or 0
    return Response({'average_units_sold_per_sale': average_units_sold})    

@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_sales_growth_rate_api(request, start_date, end_date):

    start_date = timezone.make_aware(timezone.datetime.strptime(start_date, '%Y-%m-%d'))
    end_date = timezone.make_aware(timezone.datetime.strptime(end_date, '%Y-%m-%d') + timezone.timedelta(days=1) - timezone.timedelta(seconds=1))

    sales_start = Sale.objects.filter(date_sold__lte=start_date, aproved=True).aggregate(total=models.Sum('total_amount'))['total'] or 0
    sales_end = Sale.objects.filter(date_sold__lte=end_date, aproved=True).aggregate(total=models.Sum('total_amount'))['total'] or 0

    if sales_start == 0:
        growth_rate = 0
    else:
        growth_rate = ((sales_end - sales_start) / sales_start) * 100

    return Response({'sales_growth_rate': growth_rate})


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@api_view(['GET'])
def get_average_order_value_api(request):
    average_order_value = Sale.objects.filter(aproved=True).aggregate(average=models.Avg('total_amount'))['average'] or 0
    return Response({'average_order_value': average_order_value})

