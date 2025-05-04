import hmac
import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import PaymentSessionSerializer
from .services import get_paymob_auth_token, register_order, get_payment_key, handle_webhook,build_billing_data
from .models import Payment
from orders.models import Order
from django.conf import settings

class PaymentSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # only logged-in users :contentReference[oaicite:6]{index=6}

    def post(self, request):
        serializer = PaymentSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

         # Get the order
        order_id = serializer.validated_data['order_id']
        amount = serializer.validated_data['amount_cents']

        order = Order.objects.get(pk=order_id)

        # Calculate the total by summing up the order items
        # This replaces the direct access to order.total which doesn't exist
        order_total = sum(item.price * item.quantity for item in order.items.all())
        order_total_cents = int(float(order_total) * 100)

        print(f"Processing payment for order {order_id}: Amount in cents {amount}, calculated total: {order_total_cents}")

        # Use the calculated total or the provided amount
        # amount = order_total_cents  # Uncomment this to enforce using calculated amount

        # 1. Get auth token
        auth_token = get_paymob_auth_token()

        # 2. Register order with Paymob
        paymob_order_id = register_order(str(order_id), amount, auth_token)

        # 3. Build billing data from order
        billing_data = build_billing_data(order)

        # 4. Generate payment key with billing data
        payment_key = get_payment_key(paymob_order_id, amount, auth_token, billing_data)

        # 4. Persist Payment record
        payment = Payment.objects.create(
            order = order,  # Correct reference to Order object
            paymob_order_id = paymob_order_id,
            payment_key = payment_key,
            user = request.user,
            status = 'initiated'
        )

        return Response({
            'payment_id': payment.id,
            'payment_key': payment_key,
            'iframe_id': settings.PAYMOB_IFRAME_ID,
        }, status=status.HTTP_201_CREATED)


class PaymentConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .serializers import PaymentConfirmSerializer
        serializer = PaymentConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = Payment.objects.get(pk=serializer.validated_data['payment_id'])
        payment.transaction_id = serializer.validated_data['transaction_id']
        payment.status         = serializer.validated_data['status']
        payment.save(update_fields=['transaction_id','status'])

        #FIXME: Order model does not have an is_paid field, so Django raises ValueError
        #NOTE: we can dd is_paid = models.BooleanField(default=False) to orders.models.Order and run migrations,or remove the block that sets order.is_paid
        # Mark order as paid
        # order = payment.order
        # if payment.status == 'paid':
        #     order.is_paid = True
        #     order.save(update_fields=['is_paid'])

        return Response({'detail': 'Payment updated.'})



class PaymentWebhook(APIView):
    permission_classes = [permissions.AllowAny]  # Paymob doesn’t send a DRF token

    def post(self, request):
        result = handle_webhook(request)
        if not result['success']:
            return Response({'detail': result['message']},
                            status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': result['message']},
                        status=status.HTTP_200_OK)