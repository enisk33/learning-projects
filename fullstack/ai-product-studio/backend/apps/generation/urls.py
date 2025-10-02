from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ImageGenerationJobViewSet

router = DefaultRouter()
router.register("jobs", ImageGenerationJobViewSet, basename="generation-jobs")

urlpatterns = [
    path("", include(router.urls)),
]
