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

    path('index/', views.index, name='index'),
    path('index/index', views.index, name='index'),
    path('index/product_create', views.product_create, name='product_create'),
    path('index/list_of_products', views.list_of_products, name='list_of_products'),
    path('index/low_quantity_products', views.low_quantity_products, name='low_quantity_products'),
    path('index/product_details', views.product_details, name='product_details'),
    path('index/<int:pk>/product_delete/', views.product_delete, name='product_delete'),
    path('index/<int:pk>/edit_product/', views.product_delete, name='edit_product'),
    path('index/sales', views.sales, name='sales'),
    path('index/sales_create', views.sales_create, name='sales_create'),
    path('index/sales_list', views.sales_list, name='sales_list'),
    path('index/sales_details', views.sales_details, name='sales_details'),
    path('index/sales_delete', views.sales_delete, name='sales_delete'),
    path('index/product_create', views.product_create, name='product_create'),
    path('index/product_create', views.product_create, name='product_create'),
    path('index/product_create', views.product_create, name='product_create'),
    
]
