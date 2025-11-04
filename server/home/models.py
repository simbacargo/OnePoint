from django.db import models
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Vehicle(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    brand = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    part_number = models.CharField(max_length=100, blank=True)
    vehicles = models.ManyToManyField(Vehicle, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sold_units = models.PositiveIntegerField(default=0)
    amount_collected = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
        models.Index(fields=['name']),
        models.Index(fields=['brand']),
        models.Index(fields=['part_number']),
    ]


    def __str__(self):
        return f"{self.name} ({self.brand})"

    def update_stock(self, sold_units, amount_collected):
        self.sold_units += sold_units
        self.quantity = max(0, self.quantity - sold_units)
        self.amount_collected += amount_collected
        self.save()


class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sales")
    quantity_sold = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    date_sold = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sale of {self.product.name} - {self.quantity_sold} units"

    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        self.total_amount = self.quantity_sold * self.price_per_unit
        super().save(*args, **kwargs)
        # Update product after saving sale
        self.product.update_stock(self.quantity_sold, self.total_amount)


# @receiver(post_save, sender=Product)
# @receiver(post_delete, sender=Product)
# def clear_product_cache(sender, instance, **kwargs):
#     cache.delete('product_list')
# @receiver(post_save, sender=Sale)
# @receiver(post_delete, sender=Sale)
# def clear_sales_cache(sender, instance, **kwargs):
#     cache.delete('sales_summary')