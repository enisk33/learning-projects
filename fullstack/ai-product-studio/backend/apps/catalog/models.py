from django.db import models


class ProductTemplate(models.Model):
    class ProductType(models.TextChoices):
        TSHIRT = "tshirt", "T-shirt"
        HOODIE = "hoodie", "Hoodie"
        POSTER = "poster", "Poster"
        PHONE_CASE = "phone_case", "Phone Case"

    name = models.CharField(max_length=120)
    product_type = models.CharField(max_length=32, choices=ProductType.choices)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="TRY")
    mockup_image_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

# Create your models here.
