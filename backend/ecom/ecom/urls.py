from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/register/', include('api.v1.register.urls')),
    path('api/v1/user/', include('api.v1.user.urls')),
    path('api/v1/manager/', include('api.v1.manager.urls')),
    path('api/v1/public/', include('api.v1.public.urls')),
]
