import uuid

from django.conf import settings
from django.db import models


class ImageGenerationJob(models.Model):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    class Style(models.TextChoices):
        FUTURISTIC = "futuristic", "Futuristic"
        STREETWEAR = "streetwear", "Streetwear"
        MINIMAL = "minimal", "Minimal"
        POSTER_ART = "poster_art", "Poster Art"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="image_jobs")
    prompt = models.TextField()
    style = models.CharField(max_length=32, choices=Style.choices, default=Style.FUTURISTIC)
    product_intent = models.CharField(max_length=80, default="tshirt")
    aspect_ratio = models.CharField(max_length=16, default="1:1")
    reference_image = models.ImageField(upload_to="references/%Y/%m/", blank=True, null=True)
    output_image_url = models.URLField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.QUEUED)
    provider = models.CharField(max_length=80, default="mock")
    provider_payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.prompt[:48]} ({self.status})"

# Create your models here.
