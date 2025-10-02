from rest_framework import serializers

from .models import ImageGenerationJob


class ImageGenerationJobSerializer(serializers.ModelSerializer):
    reference_image_url = serializers.SerializerMethodField()

    class Meta:
        model = ImageGenerationJob
        fields = [
            "id",
            "prompt",
            "style",
            "product_intent",
            "aspect_ratio",
            "reference_image",
            "reference_image_url",
            "output_image_url",
            "status",
            "provider",
            "provider_payload",
            "error_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference_image_url",
            "output_image_url",
            "status",
            "provider",
            "provider_payload",
            "error_message",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {"reference_image": {"required": False, "allow_null": True}}

    def get_reference_image_url(self, obj):
        if not obj.reference_image:
            return None
        request = self.context.get("request")
        url = obj.reference_image.url
        return request.build_absolute_uri(url) if request else url
