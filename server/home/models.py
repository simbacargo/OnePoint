from django.db import models

# Create your models here.
class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    brand = models.CharField(max_length=100)
    price = models.CharField(max_length=100)
    part_number = models.CharField(max_length=100)
    vehicles = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    amount = models.CharField(max_length=100)
    sold_units = models.CharField(max_length=100)
    amount_collected = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    cache.delete('product_list')  # Clear the cached list of products