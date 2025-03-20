import logging

from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
router = routers.DefaultRouter()

logger = logging.getLogger(__name__)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),
    path('', include("quicke.urls")),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
