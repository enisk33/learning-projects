from rest_framework import permissions, viewsets

from .models import ProductTemplate
from .serializers import ProductTemplateSerializer


class ProductTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = ProductTemplate.objects.filter(is_active=True)
    serializer_class = ProductTemplateSerializer

# Create your views here.
