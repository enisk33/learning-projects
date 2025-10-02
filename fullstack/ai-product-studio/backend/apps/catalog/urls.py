from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductTemplateViewSet

router = DefaultRouter()
router.register("products", ProductTemplateViewSet, basename="products")

urlpatterns = [
    path("", include(router.urls)),
]
