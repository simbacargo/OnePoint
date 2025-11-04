from django.urls import include, path
from rest_framework import routers
from home import views
from django.contrib import admin

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'products', views.ProductViewSet) # 'products' will be the base URL for the API

# router.register(r'api', views.UserViewSet)
#router.register(r'groups', views.GroupViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))

    ]

urlpatterns += [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    # path('logout/', views.logout, name='logout'),
    path('admin/', admin.site.urls),

    path('index/index/', views.index, name='index'),
    path('index/index/index', views.index, name='index'),
    path('index/index/product_create', views.product_create, name='product_create'),
    path('index/index/list_of_products', views.list_of_products, name='list_of_products'),
    path('index/index/low_quantity_products', views.low_quantity_products, name='low_quantity_products'),
    path('index/index/product_details', views.product_details, name='product_details'),
    path('index/index/<int:pk>/product_delete/', views.product_delete, name='product_delete'),
    path('index/index/<int:pk>/edit_product/', views.edit_product, name='edit_product'),
    path('index/index/sales', views.sales_summary_view, name='sales_summary_view'),
    path('index/index/sales_create', views.sales_create, name='sales_create'),
    path('index/index/sales_list', views.sales_list, name='sales_list'),
    path('index/index/sales_details', views.sales_details, name='sales_details'),
    path('index/index/sales_delete', views.sales_delete, name='sales_delete'),
    path('index/index/product_create', views.product_create, name='product_create'),
    path('index/index/product_create', views.product_create, name='product_create'),
    path('index/index/product_create', views.product_create, name='product_create'),
    
]


urlpatterns += [
    path('index/sales/', views.list_sales, name='list_sales'),
    path('index/sales/add/', views.create_sale, name='create_sale'),
    path('index/sales/<int:pk>/edit/', views.edit_sale, name='edit_sale'),
    path('index/sales/<int:pk>/delete/', views.delete_sale, name='delete_sale'),

    path("index/dashboard/", views.dashboard, name="dashboard"),
]
