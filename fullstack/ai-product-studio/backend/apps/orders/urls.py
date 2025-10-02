from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PrintOrderViewSet

router = DefaultRouter()
router.register("", PrintOrderViewSet, basename="orders")

urlpatterns = [
    path("", include(router.urls)),
]
