from rest_framework import serializers

from .models import ProductTemplate


class ProductTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTemplate
        fields = [
            "id",
            "name",
            "product_type",
            "base_price",
            "currency",
            "mockup_image_url",
        ]
