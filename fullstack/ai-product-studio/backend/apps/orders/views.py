from rest_framework import permissions, viewsets

from .models import PrintOrder
from .serializers import PrintOrderSerializer


class PrintOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PrintOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return PrintOrder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Create your views here.
