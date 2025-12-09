from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Product, Category, Tag

@receiver([post_save, post_delete], sender=Product)
@receiver([post_save, post_delete], sender=Category)
@receiver([post_save, post_delete], sender=Tag)
def clear_cache_on_change(sender, **kwargs):
    cache_keys = [
        'product_list',
        'category_list',
        'tag_list',
        'latest_products',
    ]
    
    for key in cache_keys:
        cache.delete(key)
