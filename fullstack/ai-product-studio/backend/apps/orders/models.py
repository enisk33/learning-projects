from django.conf import settings
from django.db import models


class PrintOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PAYMENT_PENDING = "payment_pending", "Payment Pending"
        PAID = "paid", "Paid"
        SENT_TO_VENDOR = "sent_to_vendor", "Sent To Vendor"
        SHIPPED = "shipped", "Shipped"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="print_orders")
    generation_job = models.ForeignKey("generation.ImageGenerationJob", on_delete=models.PROTECT)
    product_template = models.ForeignKey("catalog.ProductTemplate", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.DRAFT)
    shipping_snapshot = models.JSONField(default=dict, blank=True)
    vendor_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.pk} - {self.status}"

# Create your models here.
