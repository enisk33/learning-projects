from django.contrib import admin

from .models import ProductTemplate


@admin.register(ProductTemplate)
class ProductTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "product_type", "base_price", "currency", "is_active")
    list_filter = ("product_type", "is_active")
    search_fields = ("name",)

# Register your models here.
