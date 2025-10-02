from django.contrib import admin

from .models import PrintOrder


@admin.register(PrintOrder)
class PrintOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "product_template", "quantity", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__username",)
    readonly_fields = ("created_at", "updated_at")

# Register your models here.
