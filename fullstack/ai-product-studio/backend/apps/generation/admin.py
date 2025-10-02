from django.contrib import admin

from .models import ImageGenerationJob


@admin.register(ImageGenerationJob)
class ImageGenerationJobAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "style", "product_intent", "created_at")
    list_filter = ("status", "style", "product_intent")
    search_fields = ("prompt", "user__username")
    readonly_fields = ("id", "provider_payload", "created_at", "updated_at")

# Register your models here.
