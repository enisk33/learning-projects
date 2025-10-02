from decimal import Decimal

from django.db import migrations


def seed_product_templates(apps, schema_editor):
    ProductTemplate = apps.get_model("catalog", "ProductTemplate")
    products = [
        {
            "name": "Oversize T-shirt",
            "product_type": "tshirt",
            "base_price": Decimal("499.00"),
            "currency": "TRY",
        },
        {
            "name": "Gallery Poster",
            "product_type": "poster",
            "base_price": Decimal("349.00"),
            "currency": "TRY",
        },
        {
            "name": "Phone Case",
            "product_type": "phone_case",
            "base_price": Decimal("299.00"),
            "currency": "TRY",
        },
        {
            "name": "Premium Hoodie",
            "product_type": "hoodie",
            "base_price": Decimal("899.00"),
            "currency": "TRY",
        },
    ]

    for product in products:
        ProductTemplate.objects.update_or_create(
            product_type=product["product_type"],
            defaults=product,
        )


def unseed_product_templates(apps, schema_editor):
    ProductTemplate = apps.get_model("catalog", "ProductTemplate")
    ProductTemplate.objects.filter(
        product_type__in=["tshirt", "poster", "phone_case", "hoodie"],
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_product_templates, unseed_product_templates),
    ]
