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

logger = logging.getLogger(__name__)

def verify_webhook_signature(data: dict, signature: str) -> bool:
def verify_webhook_signature(data: dict, signature: str) -> bool:
    """
    Verify webhook signature according to PayMob's HMAC specification.

    Steps:
    1. Sort data keys lexicographically
    2. Concatenate values in sorted order
    3. Hash with SHA-512 using HMAC secret
    4. Compare with received HMAC
    """
    try:
        # Validate HMAC key exists
        if not settings.PAYMOB_HMAC_KEY:
            logger.error("PAYMOB_HMAC_KEY is not configured!")
            return False

        # Helper to convert boolean to lowercase string
        def bool_to_str(value):
            if isinstance(value, bool):
                return str(value).lower()
            return str(value) if value is not None else ''

        # Helper to get nested values
        def get_nested(data, *keys):
            value = data
            for key in keys:
                if isinstance(value, dict):
                    value = value.get(key, '')
                else:
                    return ''
            return value

        # Extract order ID from nested dict
        order_value = data.get('order', '')
        if isinstance(order_value, dict):
            order_id = order_value.get('id', '')
        else:
            order_id = order_value

        # PayMob's required fields in LEXICOGRAPHICAL order
        # Based on their example: amount_cents, created_at, currency, error_occured, etc.
        fields_dict = {
            'amount_cents': str(data.get('amount_cents', '')),
            'created_at': str(data.get('created_at', '')),
            'currency': str(data.get('currency', '')),
            'error_occured': bool_to_str(data.get('error_occured', '')),
            'has_parent_transaction': bool_to_str(data.get('has_parent_transaction', '')),
            'id': str(data.get('id', '')),
            'integration_id': str(data.get('integration_id', '')),
            'is_3d_secure': bool_to_str(data.get('is_3d_secure', '')),
            'is_auth': bool_to_str(data.get('is_auth', '')),
            'is_capture': bool_to_str(data.get('is_capture', '')),
            'is_refunded': bool_to_str(data.get('is_refunded', '')),
            'is_standalone_payment': bool_to_str(data.get('is_standalone_payment', '')),
            'is_voided': bool_to_str(data.get('is_voided', '')),
            'order': str(order_id),
            'owner': str(data.get('owner', '')),
            'pending': bool_to_str(data.get('pending', '')),
            'source_data_pan': str(get_nested(data, 'source_data', 'pan')),
            'source_data_sub_type': str(get_nested(data, 'source_data', 'sub_type')),
            'source_data_type': str(get_nested(data, 'source_data', 'type')),
            'success': bool_to_str(data.get('success', ''))
        }

        # Step 1: Sort keys lexicographically (already sorted above)
        sorted_keys = sorted(fields_dict.keys())

        # Step 2: Concatenate values in sorted order
        concatenated_string = ''.join(fields_dict[key] for key in sorted_keys)

        logger.info("=" * 80)
        logger.info(" PAYMOB HMAC VERIFICATION")
        logger.info("=" * 80)
        logger.info(f"HMAC Key configured: {bool(settings.PAYMOB_HMAC_KEY)}")
        logger.info(f"HMAC Key length: {len(settings.PAYMOB_HMAC_KEY) if settings.PAYMOB_HMAC_KEY else 0}")
        logger.info(f"\ Field Values (sorted):")
        for key in sorted_keys:
            logger.info(f"  {key}: {fields_dict[key]}")
        logger.info(f"\n🔗 Concatenated String:")
        logger.info(f"  Length: {len(concatenated_string)}")
        logger.info(f"  First 150 chars: {concatenated_string[:150]}")
        logger.info(f"  Last 50 chars: {concatenated_string[-50:]}")

        # Step 3 & 4: Calculate HMAC using SHA-512
        computed_hmac = hmac.new(
            settings.PAYMOB_HMAC_KEY.encode('utf-8'),
            concatenated_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        logger.info(f"\nHMAC Comparison:")
        logger.info(f"  Computed: {computed_hmac}")
        logger.info(f"  Received: {signature}")
        logger.info(f"  Match: {hmac.compare_digest(computed_hmac, signature)}")
        logger.info("=" * 80)

        # Step 5: Compare
        return hmac.compare_digest(computed_hmac, signature)

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
        success = data.get('success', False)

        # Handle nested order object
        order_value = data.get('order')
        if isinstance(order_value, dict):
            paymob_order_id = order_value.get('id')
        else:
            paymob_order_id = order_value

        txn_id = data.get('id')
        error_occurred = data.get('error_occured', False)

        logger.info(f" Processing webhook: order={paymob_order_id}, txn={txn_id}, success={success}")

        if not paymob_order_id:
            logger.error("Webhook missing order ID")
            return

        try:
            payment = Payment.objects.get(paymob_order_id=paymob_order_id)
            logger.info(f"Found payment: ID={payment.id}, status={payment.status}")
        except Payment.DoesNotExist:
            logger.error(f"No Payment found for Paymob order {paymob_order_id}")
            return

        # Update payment status
        if success and not error_occurred:
            payment.status = 'paid'
            payment.transaction_id = str(txn_id)
            payment.order.payment_status = 'C'
            payment.order.save(update_fields=['payment_status'])
            logger.info(f"Payment successful for order {payment.order.id}")
        else:
            payment.status = 'failed'
            payment.order.payment_status = 'F'
            payment.order.save(update_fields=['payment_status'])
            logger.info(f"Payment failed for order {payment.order.id}")

        payment.save(update_fields=['status', 'transaction_id', 'updated_at'])
        logger.info(f"Updated Payment ID {payment.id} to status: {payment.status}")

    except Exception as e:
        logger.error(f"Error in process_payment_event: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

def handle_webhook(request) -> dict:
    """
    Orchestrates verification and processing of a Paymob webhook.
    """
    try:
        # PayMob sends HMAC as query parameter
        signature = request.GET.get('hmac', '')

        logger.info("=" * 80)
        logger.info("📬 WEBHOOK RECEIVED")
        logger.info(f"Signature (first 20): {signature[:20]}...")
        logger.info("=" * 80)

        # Parse webhook data
        try:
            data = request.data
        except Exception as e:
            logger.error(f"Failed to parse JSON: {e}")
            return {'success': False, 'message': 'Invalid JSON'}

        # Verify signature
        if not verify_webhook_signature(data, signature):
            logger.warning("HMAC verification failed")
            return {'success': False, 'message': 'Invalid signature'}

        logger.info("HMAC verified successfully")

        # Process payment
        try:
            process_payment_event(data)
            return {'success': True, 'message': 'Webhook processed'}
        except Exception as e:
            logger.exception(f"Error processing webhook: {e}")
            return {'success': False, 'message': 'Processing error'}

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
