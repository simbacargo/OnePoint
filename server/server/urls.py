from django.urls import include, path
from rest_framework import routers
from home import views
from django.contrib import admin
from authentication import views as bootcamp_auth_views
from django.contrib.auth.views import LogoutView, LoginView
router = routers.DefaultRouter()
#router.register(r'users', views.UserViewSet)
router.register(r'products', views.ProductViewSet) # 'products' will be the base URL for the API
router.register(r'sales', views.SaleViewSet) # router.register(r'api', views.UserViewSet)
#router.register(r'groups', views.GroupViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
     path('api/', include(router.urls)),
#     path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))

    ]

urlpatterns += [
    # path('signup/', views.signup, name='signup'),
    # path('login/', views. login, name='login'),
    # path('logout/', views.logout, name='logout'),
    path('admin/', admin.site.urls),

    path('', views.index, name='index'),
    path('index/', views.index, name='index'),
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

    #####   Authentication  ###
    # path(r'accounts/login/', auth_views.LoginView.as_view()),
        path(r'signup_api/', bootcamp_auth_views.signup_api, name='signup'),
        path(r'signup/', bootcamp_auth_views.signup, name='signup'),
        path(r'activate/<slug:uidb64>/<slug:token>/', bootcamp_auth_views.activate, name='activate'),
    path(r'login', LoginView.as_view(), name='login'),
    path(r'login/', LoginView.as_view(), name='login'),
     path('logout', LogoutView.as_view(), {'next_page': "/"}, name='logout'),
    path('auth/', include('authentication.urls',namespace='authentication')),   
        path(r'profile_view/', bootcamp_auth_views.ProfileUpdateView.as_view(), name='user_settings'),
path('accounts/', include('allauth.urls')),
    # path(r'login', auth_views.LoginView.as_view(), name='login'),
    # path(r'logout', auth_views.LoginView.as_view(), {'next_page': '/'}, name='logout'),


]#
urlpatterns += [
    path('index/sales/', views.list_sales, name='list_sales'),
    path('index/sales/add/', views.create_sale, name='create_sale'),
    path('index/sales/<int:pk>/edit/', views.edit_sale, name='edit_sale'),
    path('index/sales/<int:pk>/delete/', views.delete_sale, name='delete_sale'),
    path('index/sales/list_unverified_sales/', views.list_unverified_sales, name='list_unverified_sales'),
    path("index/dashboard/", views.dashboard, name="dashboard"),
    path('index/sales/<int:pk>/verify_sale/', views.verify_sale, name='verify_sale'),
]


urlpatterns += [
    path('create/', views.create_sale, name='create_sale'),
    path('search-products/', views.search_products, name='search_products'),
    path('search-products/', views.search_products, name='product_search_url'),
    path('api/get_product_price/<int:product_id>/', views.get_product_price, name='get_product_price'),
    path('filter-products/', views.product_list, name='product_list'),
    path('api/productdetails/<int:pk>/', views.ProductDetailView.as_view(), name='product_detail'),

]

# your_project/your_app/urls.py


urlpatterns += [
    path('customers/', views.CustomerListView.as_view(), name='customer_list'),  # View all customers
    path('customers/create/', views.CustomerCreateView.as_view(), name='customer_create'),  # Create a new customer
    path('customers/<int:pk>/', views.CustomerDetailView.as_view(), name='customer_detail'),  # View a single customer
    path('customers/<int:pk>/update/', views.CustomerUpdateView.as_view(), name='customer_update'),  # Update an existing customer
    path('customers/<int:pk>/delete/', views.CustomerDeleteView.as_view(), name='customer_delete'),  # Delete a customer

    path('search_vehicles/', views.search_vehicles, name='search_vehicles'),
   path('sales/', views.SaleListView.as_view(), name='sale-list'),  # For listing and creating sales
    path('sales/<int:pk>/', views.SaleDetailView.as_view(), name='sale-detail'),  # For viewing, updating, or deleting a single sale
]


from django.urls import path
from authentication.views import RegisterView , LoginView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns += [
    path('register/', RegisterView.as_view(), name='register'),
    path('login_api/', LoginView.as_view(), name='login_api'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Optional: refresh token view
]


# urls.py (in your Django app)
from django.urls import path
from payments.views import InitiateMpesaPaymentView, MpesaCallbackView

rlpatterns = [
    # 1. URL called by the React Native App to START the payment
    path('initiate/', InitiateMpesaPaymentView.as_view(), name='mpesa_initiate'),
    
    # 2. URL called by M-Pesa to report the FINAL transaction status (This is your CALLBACK/WEBHOOK)
    path('callback/', MpesaCallbackView.as_view(), name='mpesa_callback'),
]
