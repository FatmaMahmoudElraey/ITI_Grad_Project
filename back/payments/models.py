from django.db import models
from orders.models import Order
from django.conf import settings
class Payment(models.Model):

    order= models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user= models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    paymob_order_id = models.IntegerField()
    payment_key = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='pending')
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.order.pk} ({self.status})"