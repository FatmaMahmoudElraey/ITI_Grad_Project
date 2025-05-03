from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Payment

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    order_id = serializers.IntegerField(source='order.pk')
    paymob_order_id = serializers.IntegerField(required=True)
    payment_key = serializers.CharField(max_length=255, required=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    class Meta:
        model = Payment
        fields = [
         'id',
         'user',
         'order_id',
         'paymob_order_id',
         'payment_key',
         'status',
         'transaction_id',
         'created_at',
         'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']



class PaymentSessionSerializer(serializers.Serializer):
    order_id     = serializers.IntegerField()
    amount_cents = serializers.IntegerField(min_value=1)

    def validate_order_id(self, value):
        from orders.models import Order
        if not Order.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Order not found.")
        return value

class PaymentConfirmSerializer(serializers.Serializer):
    payment_id    = serializers.IntegerField()
    transaction_id= serializers.CharField()
    status        = serializers.ChoiceField(choices=['paid','failed'])

    def validate_payment_id(self, value):
        from .models import Payment
        if not Payment.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Payment session not found.")
        return value
