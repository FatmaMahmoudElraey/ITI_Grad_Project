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

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """
    Verify that the incoming webhook payload was signed by Paymob.
    Uses HMAC SHA-256 with the HMAC key from settings.
    """
    # Compute HMAC using your secret key
    computed = hmac.new(
        settings.PAYMOB_HMAC_KEY.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    # Constant‐time compare to prevent timing attacks (OWASP) :contentReference[oaicite:0]{index=0}
    return hmac.compare_digest(computed, signature)

def process_payment_event(data: dict) -> None:
    """
    Update the Payment record based on the Paymob webhook event.
    Recognized events: 'payment_succeeded', 'payment_failed'.
    """
    event = data.get('event')
    order_id = data.get('order', {}).get('id')
    txn_id = data.get('transaction', {}).get('id')

    if not order_id:
        logger.error("Webhook missing order ID")  # robust logging :contentReference[oaicite:1]{index=1}
        return

    try:
        payment = Payment.objects.get(paymob_order_id=order_id)
    except Payment.DoesNotExist:
        logger.error(f"No Payment found for Paymob order {order_id}")
        return

    # Map events to internal statuses :contentReference[oaicite:2]{index=2}
    if event == 'payment_succeeded':
        payment.status = 'paid'
        payment.transaction_id = txn_id
    elif event == 'payment_failed':
        payment.status = 'failed'
    else:
        logger.warning(f"Unhandled Paymob event type: {event}")
        return

    payment.save(update_fields=['status', 'transaction_id', 'updated_at'])
    logger.info(f"Processed '{event}' for Payment ID {payment.id}")

def handle_webhook(request) -> dict:
    """
    Orchestrates verification and processing of a Paymob webhook.
    Returns a dict with 'success' and 'message'.
    """
    # DRF provides request.META for HTTP headers :contentReference[oaicite:3]{index=3}
    signature = request.headers.get('X-Paymob-Signature', '')
    payload = request.body

    # 1) Signature verification
    if not verify_webhook_signature(payload, signature):
        logger.warning("Invalid webhook signature")
        return {'success': False, 'message': 'Invalid signature'}

    # 2) Delegate to event processor
    data = request.data  # parsed JSON :contentReference[oaicite:4]{index=4}
    try:
        process_payment_event(data)
    except Exception as e:
        logger.exception(f"Error processing webhook: {e}")  # full traceback in logs :contentReference[oaicite:5]{index=5}
        return {'success': False, 'message': 'Error processing event'}

    return {'success': True, 'message': 'Webhook processed'}

def get_paymob_auth_token() -> str:
    """Get authentication token from Paymob API"""
    payload = {"api_key": settings.PAYMOB_API_KEY}
    log_payment_step("AUTH", payload)

    response = requests.post(
        settings.PAYMOB_AUTH_URL,
        json=payload
    )
    response.raise_for_status()

    result = response.json()
    log_payment_step("AUTH", {"success": True, "token_length": len(result["token"])}, is_response=True)
    return result["token"]

def register_order(order_id: str, amount_cents: int, auth_token: str) -> int:
    # Your existing code for merchant_order_id and payload
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

    # Your existing HTTP request code
    response = requests.post(settings.PAYMOB_ORDER_URL, json=payload)
    try:
        response.raise_for_status()
        data = response.json()
        log_payment_step("REGISTER_ORDER", data, is_response=True)
        return data["id"]
    except requests.exceptions.HTTPError:
        error_data = {"status_code": response.status_code, "response_text": response.text}
        log_payment_step("REGISTER_ORDER_ERROR", error_data, is_response=True)
        raise

def get_payment_key(order_id: str, amount_cents: int, auth_token: str, billing_data: dict) -> str:
    # Log raw billing data before processing
    log_payment_step("BILLING_DATA_ORIGINAL", billing_data)

    # Your existing code for ensuring required fields
    required_fields = ["first_name", "last_name", "email", "phone_number"]
    for field in required_fields:
        if not billing_data.get(field):
            billing_data[field] = "NA" if field != "email" else "customer@example.com"

    # Build the payload
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

    # Your existing request code
    response = requests.post(
        settings.PAYMOB_PAYMENT_KEY_URL,
        json=payload
    )

    try:
        response.raise_for_status()
        result = response.json()
        log_payment_step("PAYMENT_KEY", {"success": True, "token": result["token"][:20] + "..."}, is_response=True)
        return result["token"]
    except requests.exceptions.HTTPError:
        error_data = {"status_code": response.status_code, "response_text": response.text}
        log_payment_step("PAYMENT_KEY_ERROR", error_data, is_response=True)
        raise

def build_billing_data(order):
    """Extract billing data from an Order instance with foolproof fallbacks."""
    user = order.user

    # Enhanced debugging log
    print("\n---- BUILDING BILLING DATA ----")
    print(f"Order ID: {order.id}")

    # Create billing data with guaranteed non-null values
    billing_data = {
        # User information
        "email": (user.email if user and getattr(user, 'email', None) else "customer@example.com"),
        "first_name": (user.first_name if user and getattr(user, 'first_name', None) else "Customer"),
        "last_name": (user.last_name if user and getattr(user, 'last_name', None) else "Name"),

        # Order information with fallbacks
        "phone_number": str(getattr(order, "phone", "+201000000000") or "+201000000000"),
        "apartment": str(getattr(order, "apartment", "NA") or "NA"),
        "floor": str(getattr(order, "floor", "NA") or "NA"),
        "street": str(getattr(order, "shipping_address", "NA") or "NA"),
        "building": str(getattr(order, "building", "NA") or "NA"),
        "shipping_method": str(getattr(order, "shipping_method", "NA") or "NA"),
        "postal_code": str(getattr(order, "postal_code", "NA") or "NA"),
        "city": str(getattr(order, "city", "NA") or "NA"),
        "country": str(getattr(order, "country", "EG") or "EG"),
        "state": str(getattr(order, "state", "NA") or "NA")
    }

    # Log all billing data fields to help with debugging
    for key, value in billing_data.items():
        print(f"  {key}: {value!r}")

    return billing_data

def log_payment_step(step_name, data, is_response=False):
    """Log payment process steps with detailed formatting"""
    prefix = "RESPONSE from" if is_response else "REQUEST to"

    # Remove sensitive data before logging
    if isinstance(data, dict):
        data = data.copy()
        if 'auth_token' in data:
            data['auth_token'] = '***REDACTED***'
        if 'api_key' in data:
            data['api_key'] = '***REDACTED***'

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    print(f"\n[{timestamp}] 💳 PAYMENT STEP {step_name}: {prefix} PayMob API")
    print("-" * 80)
    try:
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(str(data))
    print("-" * 80)
