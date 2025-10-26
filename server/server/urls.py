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
]
