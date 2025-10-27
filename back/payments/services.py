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
    """
    Verify webhook signature according to PayMob's HMAC specification.
    PayMob sends transaction data nested in the 'obj' key.
    """
    try:
        # Validate HMAC key exists
        if not settings.PAYMOB_HMAC_KEY:
            print("❌ PAYMOB_HMAC_KEY is not configured!")
            logger.error("PAYMOB_HMAC_KEY is not configured!")
            return False

        # Extract the actual transaction object from the webhook payload
        transaction = data.get('obj', {})

        print(f"🔍 Webhook structure - Top level keys: {list(data.keys())}")
        print(f"🔍 Transaction object keys: {list(transaction.keys()) if isinstance(transaction, dict) else 'Not a dict'}")

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

        # Extract order ID from nested dict - use transaction object
        order_value = transaction.get('order', '')
        if isinstance(order_value, dict):
            order_id = order_value.get('id', '')
        else:
            order_id = order_value

        # PayMob's required fields in LEXICOGRAPHICAL order - use transaction object
        fields_dict = {
            'amount_cents': str(transaction.get('amount_cents', '')),
            'created_at': str(transaction.get('created_at', '')),
            'currency': str(transaction.get('currency', '')),
            'error_occured': bool_to_str(transaction.get('error_occured', '')),
            'has_parent_transaction': bool_to_str(transaction.get('has_parent_transaction', '')),
            'id': str(transaction.get('id', '')),
            'integration_id': str(transaction.get('integration_id', '')),
            'is_3d_secure': bool_to_str(transaction.get('is_3d_secure', '')),
            'is_auth': bool_to_str(transaction.get('is_auth', '')),
            'is_capture': bool_to_str(transaction.get('is_capture', '')),
            'is_refunded': bool_to_str(transaction.get('is_refunded', '')),
            'is_standalone_payment': bool_to_str(transaction.get('is_standalone_payment', '')),
            'is_voided': bool_to_str(transaction.get('is_voided', '')),
            'order': str(order_id),
            'owner': str(transaction.get('owner', '')),
            'pending': bool_to_str(transaction.get('pending', '')),
            'source_data_pan': str(get_nested(transaction, 'source_data', 'pan')),
            'source_data_sub_type': str(get_nested(transaction, 'source_data', 'sub_type')),
            'source_data_type': str(get_nested(transaction, 'source_data', 'type')),
            'success': bool_to_str(transaction.get('success', ''))
        }

        # Step 1: Sort keys lexicographically
        sorted_keys = sorted(fields_dict.keys())

        # Step 2: Concatenate values in sorted order
        concatenated_string = ''.join(fields_dict[key] for key in sorted_keys)

        print("\n" + "=" * 80)
        print("🔐 PAYMOB HMAC VERIFICATION DEBUG")
        print("=" * 80)
        print(f"HMAC Key configured: {bool(settings.PAYMOB_HMAC_KEY)}")
        print(f"HMAC Key length: {len(settings.PAYMOB_HMAC_KEY) if settings.PAYMOB_HMAC_KEY else 0}")
        print(f"HMAC Key (first 10 chars): {settings.PAYMOB_HMAC_KEY[:10] if settings.PAYMOB_HMAC_KEY else 'N/A'}")
        print("\n📊 Field Values (in sorted order):")
        for key in sorted_keys:
            print(f"  {key:25s} = {fields_dict[key]}")
        print(f"\n🔗 Concatenated String:")
        print(f"  Total Length: {len(concatenated_string)}")
        print(f"  Full String: {concatenated_string}")

        # Step 3 & 4: Calculate HMAC using SHA-512
        computed_hmac = hmac.new(
            settings.PAYMOB_HMAC_KEY.encode('utf-8'),
            concatenated_string.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()

        print(f"\n🔑 HMAC Comparison:")
        print(f"  Computed HMAC: {computed_hmac}")
        print(f"  Received HMAC: {signature}")
        print(f"  Match Result: {hmac.compare_digest(computed_hmac, signature)}")
        print("=" * 80 + "\n")

        # Step 5: Compare
        return hmac.compare_digest(computed_hmac, signature)

    except Exception as e:
        print(f"❌ HMAC verification error: {e}")
        logger.error(f"HMAC verification error: {e}")
        import traceback
        print(traceback.format_exc())
        logger.error(traceback.format_exc())
        return False

def process_payment_event(data: dict) -> None:
    """
    Update the Payment record based on the Paymob webhook event.
    """
    try:
        # Extract the transaction object from the nested 'obj' key
        transaction = data.get('obj', {})

        success = transaction.get('success', False)

        # Handle nested order object
        order_value = transaction.get('order')
        if isinstance(order_value, dict):
            paymob_order_id = order_value.get('id')
        else:
            paymob_order_id = order_value

        txn_id = transaction.get('id')
        error_occurred = transaction.get('error_occured', False)

        print(f"📥 Processing webhook: order={paymob_order_id}, txn={txn_id}, success={success}")

        if not paymob_order_id:
            print("❌ Webhook missing order ID")
            logger.error("Webhook missing order ID")
            return

        try:
            payment = Payment.objects.get(paymob_order_id=paymob_order_id)
            print(f"✅ Found payment: ID={payment.id}, status={payment.status}")
        except Payment.DoesNotExist:
            print(f"❌ No Payment found for Paymob order {paymob_order_id}")
            logger.error(f"No Payment found for Paymob order {paymob_order_id}")
            return

        # Update payment status
        if success and not error_occurred:
            payment.status = 'paid'
            payment.transaction_id = str(txn_id)
            payment.order.payment_status = 'C'
            payment.order.save(update_fields=['payment_status'])
            print(f"✅ Payment successful for order {payment.order.id}")
        else:
            payment.status = 'failed'
            payment.order.payment_status = 'F'
            payment.order.save(update_fields=['payment_status'])
            print(f"❌ Payment failed for order {payment.order.id}")

        payment.save(update_fields=['status', 'transaction_id', 'updated_at'])
        print(f"✅ Updated Payment ID {payment.id} to status: {payment.status}")

    except Exception as e:
        print(f"❌ Error in process_payment_event: {e}")
        logger.error(f"Error in process_payment_event: {e}")
        import traceback
        print(traceback.format_exc())
        raise

def handle_webhook(request) -> dict:
    """
    Orchestrates verification and processing of a Paymob webhook.
    """
    try:
        # PayMob sends HMAC as query parameter
        signature = request.GET.get('hmac', '')

        print("\n" + "=" * 80)
        print("📬 WEBHOOK RECEIVED FROM PAYMOB")
        print(f"Signature (first 30 chars): {signature[:30]}...")
        print("=" * 80)

        # Parse webhook data
        try:
            data = request.data
            print(f"Webhook data type: {type(data)}")
            print(f"Webhook keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        except Exception as e:
            print(f"❌ Failed to parse JSON: {e}")
            logger.error(f"Failed to parse JSON: {e}")
            return {'success': False, 'message': 'Invalid JSON'}

        # Verify signature
        if not verify_webhook_signature(data, signature):
            print("❌ HMAC verification failed")
            logger.warning("HMAC verification failed")
            return {'success': False, 'message': 'Invalid signature'}

        print("✅ HMAC verified successfully")

        # Process payment
        try:
            process_payment_event(data)
            return {'success': True, 'message': 'Webhook processed'}
        except Exception as e:
            print(f"❌ Error processing webhook: {e}")
            logger.exception(f"Error processing webhook: {e}")
            return {'success': False, 'message': 'Processing error'}

    except Exception as e:
        print(f"❌ Error in handle_webhook: {e}")
        logger.error(f"Error in handle_webhook: {e}")
        import traceback
        print(traceback.format_exc())
        return {'success': False, 'message': 'Internal error'}

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
