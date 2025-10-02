from rest_framework import permissions, viewsets

from .models import ImageGenerationJob
from .serializers import ImageGenerationJobSerializer
from .services import ImageGenerationService


class ImageGenerationJobViewSet(viewsets.ModelViewSet):
    serializer_class = ImageGenerationJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return ImageGenerationJob.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        job = serializer.save(user=self.request.user, status=ImageGenerationJob.Status.RUNNING)
        ImageGenerationService().generate(job)

# Create your views here.
