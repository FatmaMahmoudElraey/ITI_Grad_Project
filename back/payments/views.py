import hmac
import hashlib
import logging
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from requests.exceptions import ConnectionError, Timeout, RequestException
from .serializers import PaymentSessionSerializer
from .services import get_paymob_auth_token, register_order, get_payment_key, handle_webhook, build_billing_data
from .models import Payment
from orders.models import Order
from django.conf import settings
from django.shortcuts import redirect

logger = logging.getLogger(__name__)

class PaymentSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the order
        order_id = serializer.validated_data['order_id']
        amount = serializer.validated_data['amount_cents']

        order = Order.objects.get(pk=order_id)

        # Calculate the total by summing up the order items
        order_total = sum(item.price * item.quantity for item in order.items.all())
        order_total_cents = int(float(order_total) * 100)

        logger.info(f"Processing payment for order {order_id}: Amount in cents {amount}, calculated total: {order_total_cents}")

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
            order=order,
            paymob_order_id=paymob_order_id,
            payment_key=payment_key,
            user=request.user,
            status='initiated'
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
        payment.status = serializer.validated_data['status']
        payment.save(update_fields=['transaction_id', 'status'])

        # Mark order payment status
        order = payment.order
        if payment.status == 'paid':
            order.payment_status = 'C'  # Complete
            order.save(update_fields=['payment_status'])
            logger.info(f"Order #{order.id} marked as complete after successful payment")
        elif payment.status == 'failed':
            order.payment_status = 'F'  # Failed
            order.save(update_fields=['payment_status'])

        return Response({'detail': 'Payment updated.'})


class PaymentWebhook(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Comprehensive logging
        logger.info("\n" + "=" * 80)
        logger.info("PAYMOB WEBHOOK INCOMING")
        logger.info("=" * 80)
        logger.info(f"Method: {request.method}")
        logger.info(f"Path: {request.path}")
        logger.info(f"Query Params: {dict(request.GET)}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Headers: {dict(request.headers)}")

        # Log raw body
        try:
            raw_body = request.body.decode('utf-8')
            logger.info(f"Raw Body (first 500 chars):\n{raw_body[:500]}")
            logger.info(f"Raw Body Length: {len(raw_body)} characters")
        except Exception as e:
            logger.error(f"Could not decode body: {e}")

        # Log parsed data structure
        logger.info(f"Parsed Data Type: {type(request.data)}")
        if isinstance(request.data, dict):
            logger.info(f"Parsed Data Keys: {list(request.data.keys())}")

        try:
            logger.info(f"Parsed Data (formatted):\n{json.dumps(request.data, indent=2, default=str)}")
        except Exception as e:
            logger.error(f"Could not format parsed data: {e}")
            logger.info(f"Parsed Data (raw): {request.data}")

        logger.info("=" * 80 + "\n")

        # Process webhook
        result = handle_webhook(request)

        if not result['success']:
            logger.error(f"Webhook processing failed: {result['message']}")
            return Response(
                {'detail': result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Webhook processed successfully: {result['message']}")
        return Response(
            {'detail': result['message']},
            status=status.HTTP_200_OK
        )


class PaymentResponseView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Get query parameters from PayMob
        success = request.GET.get('success', 'false')
        transaction_id = request.GET.get('id')
        order_id = request.GET.get('order')

        # Log the response parameters
        logger.info(f"Payment response received: success={success}, txn_id={transaction_id}, order={order_id}")

        # Construct the frontend URL with parameters
        frontend_url = settings.FRONTEND_URL
        redirect_url = f"{frontend_url}/payment-result?status={success}&txn_id={transaction_id}&order={order_id}"

        # Redirect the user to the frontend
        return redirect(redirect_url)