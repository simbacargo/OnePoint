import json
from django.core.management.base import BaseCommand
from home.models import Product

class Command(BaseCommand):
    help = "Import sample products from JSON file"

    def handle(self, *args, **kwargs):
        with open('./products.js', 'r') as file:
            products = json.load(file)

        for item in products:
            Product.objects.update_or_create(
                part_number=item.get("partNumber"),
                defaults={
                    "name": item.get("name"),
                    "quantity": item.get("QTY", 0),
                    "price": item.get("AMOUNT", 0),
                    # "total_amount": item.get("TOTAL AMOUNT", 0),
                    "sold_units": item.get("SOLD") or 0,
                    "amount_collected": item.get("AMOUNT COLLECTED") or 0,
                    # "amount": item.get("BALANCE") or 0,
                    # "qty_remain": item.get("QTY_REMAIN", 0),
                }
            )

        self.stdout.write(self.style.SUCCESS(f"✅ Imported {len(products)} products successfully."))
