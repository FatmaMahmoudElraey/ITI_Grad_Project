# payments/services.py

import hmac
import hashlib
import logging
import requests
import uuid
import json
from datetime import datetime
from django.conf import settings
from .models import Payment
from requests.exceptions import ConnectionError, Timeout, RequestException
from rest_framework.exceptions import APIException
from rest_framework import status

logger = logging.getLogger(__name__)

def verify_webhook_signature(data: dict, signature: str) -> bool:
    """
    Verify that the incoming webhook payload was signed by Paymob.
    PayMob concatenates specific fields in order before hashing.
    """
    try:
        # Helper function to safely get nested values
        def get_nested(data, *keys):
            """Get nested dictionary values"""
            value = data
            for key in keys:
                if isinstance(value, dict):
                    value = value.get(key, '')
                else:
                    return ''
            return value

        # Helper to convert boolean to lowercase string (true/false)
        def bool_to_str(value):
            """Convert Python boolean to lowercase string for PayMob"""
            if isinstance(value, bool):
                return str(value).lower()
            return str(value)

        # Extract order ID - PayMob sends it as nested dict in webhook
        order_value = data.get('order', '')
        if isinstance(order_value, dict):
            order_id = order_value.get('id', '')
        else:
            order_id = order_value

        logger.info("=" * 80)
        logger.info("🔐 STARTING HMAC VERIFICATION")
        logger.info(f"Order type: {type(order_value)}, Extracted ID: {order_id}")
        logger.info("=" * 80)

        # PayMob concatenates these fields in this exact order
        concatenated_string = (
            str(data.get('amount_cents', '')) +
            str(data.get('created_at', '')) +
            str(data.get('currency', '')) +
            bool_to_str(data.get('error_occured', '')) +
            bool_to_str(data.get('has_parent_transaction', '')) +
            str(data.get('id', '')) +
            str(data.get('integration_id', '')) +
            bool_to_str(data.get('is_3d_secure', '')) +
            bool_to_str(data.get('is_auth', '')) +
            bool_to_str(data.get('is_capture', '')) +
            bool_to_str(data.get('is_refunded', '')) +
            bool_to_str(data.get('is_standalone_payment', '')) +
            bool_to_str(data.get('is_voided', '')) +
            str(order_id) +
            str(data.get('owner', '')) +
            bool_to_str(data.get('pending', '')) +
            str(get_nested(data, 'source_data', 'pan')) +
            str(get_nested(data, 'source_data', 'sub_type')) +
            str(get_nested(data, 'source_data', 'type')) +
            bool_to_str(data.get('success', ''))
        )

        logger.info(f"Concatenated string (first 150): {concatenated_string[:150]}")
        logger.info(f"Total length: {len(concatenated_string)}")

        # Compute HMAC using your secret key
        computed = hmac.new(
            settings.PAYMOB_HMAC_KEY.encode('utf-8'),
            concatenated_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        logger.info(f"Computed HMAC: {computed}")
        logger.info(f"Received HMAC: {signature}")
        logger.info(f"Match: {hmac.compare_digest(computed, signature)}")
        logger.info("=" * 80)

        return hmac.compare_digest(computed, signature)

    except Exception as e:
        logger.error(f"HMAC verification error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

def process_payment_event(data: dict) -> None:
    """
    Update the Payment record based on the Paymob webhook event.
    """
    try:
        # Extract values directly from the webhook data
        success = data.get('success', False)

        # Handle nested order object
        order_value = data.get('order')
        if isinstance(order_value, dict):
            paymob_order_id = order_value.get('id')
        else:
            paymob_order_id = order_value

        txn_id = data.get('id')
        error_occurred = data.get('error_occured', False)

        logger.info(f"Processing payment event: order={paymob_order_id}, txn={txn_id}, success={success}")

        if not paymob_order_id:
            logger.error("Webhook missing order ID")
            return

        try:
            payment = Payment.objects.get(paymob_order_id=paymob_order_id)
            logger.info(f"Found payment record: ID={payment.id}, current status={payment.status}")
        except Payment.DoesNotExist:
            logger.error(f"No Payment found for Paymob order {paymob_order_id}")
            return

        # Update payment status based on success flag
        if success and not error_occurred:
            payment.status = 'paid'
            payment.transaction_id = str(txn_id)
            # Update order payment status
            payment.order.payment_status = 'C'
            payment.order.save(update_fields=['payment_status'])
            logger.info(f"Payment successful for order {payment.order.id}")
        else:
            payment.status = 'failed'
            payment.order.payment_status = 'F'
            payment.order.save(update_fields=['payment_status'])
            logger.info(f"Payment failed for order {payment.order.id}")

        payment.save(update_fields=['status', 'transaction_id', 'updated_at'])
        logger.info(f"Processed webhook for Payment ID {payment.id}, status: {payment.status}")

    except Exception as e:
        logger.error(f"Error in process_payment_event: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

def handle_webhook(request) -> dict:
    """
    Orchestrates verification and processing of a Paymob webhook.
    Returns a dict with 'success' and 'message'.
    """
    try:
        # PayMob sends HMAC in query parameter
        signature = request.GET.get('hmac', '')
        logger.info(f"📥 Webhook signature received: {signature[:20]}...")

        # Parse the JSON data
        try:
            data = request.data  # DRF parsed JSON
            logger.info(f"Webhook data keys: {list(data.keys())}")
        except Exception as e:
            logger.error(f"Failed to parse webhook JSON: {e}")
            return {'success': False, 'message': 'Invalid JSON'}

        # 1) Signature verification
        if not verify_webhook_signature(data, signature):
            logger.warning("Invalid webhook signature")
            return {'success': False, 'message': 'Invalid signature'}

        logger.info("Webhook signature verified")

        # 2) Delegate to event processor
        try:
            process_payment_event(data)
        except Exception as e:
            logger.exception(f"Error processing webhook: {e}")
            return {'success': False, 'message': 'Error processing event'}

        return {'success': True, 'message': 'Webhook processed'}

    except Exception as e:
        logger.error(f"Error in handle_webhook: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {'success': False, 'message': 'Internal error'}

def get_paymob_auth_token():
    """Get authentication token from Paymob API"""
    try:
        response = requests.post(
            "https://accept.paymobsolutions.com/api/auth/tokens",
            json={"api_key": settings.PAYMOB_API_KEY}
        )
        response.raise_for_status()
        return response.json()["token"]
    except Exception as e:
        logger.error(f"Error getting auth token: {e}")
        raise

def register_order(order_id: str, amount_cents: int, auth_token: str) -> int:
    unique_moid = f"{order_id}-{uuid.uuid4().hex}"
    payload = {
        "auth_token": auth_token,
        "delivery_needed": False,
        "amount_cents": amount_cents,
        "currency": "EGP",
        "merchant_order_id": unique_moid,
        "items": [
            {
                "name": f"Order #{order_id}",
                "amount_cents": amount_cents,
                "description": "Order payment",
                "quantity": 1
            }
        ]
    }

    log_payment_step("REGISTER_ORDER", payload)
    response = requests.post(settings.PAYMOB_ORDER_URL, json=payload)
    response.raise_for_status()
    data = response.json()
    log_payment_step("REGISTER_ORDER", data, is_response=True)
    return data["id"]

def get_payment_key(order_id: str, amount_cents: int, auth_token: str, billing_data: dict) -> str:
    log_payment_step("BILLING_DATA_ORIGINAL", billing_data)

    payload = {
        "auth_token": auth_token,
        "amount_cents": amount_cents,
        "expiration": 3600,
        "order_id": order_id,
        "billing_data": billing_data,
        "currency": "EGP",
        "integration_id": int(settings.PAYMOB_INTEGRATION_ID)
    }

    log_payment_step("PAYMENT_KEY", payload)
    response = requests.post(settings.PAYMOB_PAYMENT_KEY_URL, json=payload)
    response.raise_for_status()
    result = response.json()
    log_payment_step("PAYMENT_KEY", {"success": True, "token": result["token"][:20] + "..."}, is_response=True)
    return result["token"]

def build_billing_data(order):
    """Extract billing data from an Order instance"""
    user = order.user
    return {
        "email": (user.email if user else "customer@example.com"),
        "first_name": (user.first_name if user else "Customer"),
        "last_name": (user.last_name if user else "Name"),
        "phone_number": str(getattr(order, "phone", "+201000000000")),
        "apartment": "NA",
        "floor": "NA",
        "street": str(getattr(order, "shipping_address", "NA")),
        "building": "NA",
        "shipping_method": "NA",
        "postal_code": str(getattr(order, "postal_code", "NA")),
        "city": str(getattr(order, "city", "NA")),
        "country": str(getattr(order, "country", "EG")),
        "state": str(getattr(order, "state", "NA"))
    }

def log_payment_step(step_name, data, is_response=False):
    """Log payment process steps"""
    prefix = "RESPONSE from" if is_response else "REQUEST to"
    if isinstance(data, dict):
        data = data.copy()
        if 'auth_token' in data:
            data['auth_token'] = '***REDACTED***'

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"\n[{timestamp}] 💳 PAYMENT STEP {step_name}: {prefix} PayMob API")
    print("-" * 80)
    print(json.dumps(data, indent=2, ensure_ascii=False))
    print("-" * 80)
