from rest_framework import serializers

from apps.catalog.serializers import ProductTemplateSerializer
from apps.generation.serializers import ImageGenerationJobSerializer

from .models import PrintOrder


class PrintOrderSerializer(serializers.ModelSerializer):
    generation_job_detail = ImageGenerationJobSerializer(source="generation_job", read_only=True)
    product_template_detail = ProductTemplateSerializer(source="product_template", read_only=True)

    class Meta:
        model = PrintOrder
        fields = [
            "id",
            "generation_job",
            "generation_job_detail",
            "product_template",
            "product_template_detail",
            "quantity",
            "status",
            "shipping_snapshot",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]
