# payments/services.py

import hmac
import hashlib
import logging
import requests
import uuid
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
    response = requests.post(
        settings.PAYMOB_AUTH_URL,
        json={"api_key": settings.PAYMOB_API_KEY}
    )
    response.raise_for_status()
    return response.json()["token"]

def register_order(order_id: str, amount_cents: int, auth_token: str) -> int:

    #BUG: EVERY ORDER HAS THE SAME merchant_order_id
    #FIXME Create a unique merchant_order_id using UUID4
    unique_moid = f"{order_id}-{uuid.uuid4().hex}"

    # Construct payload with items array
    payload = {
        "auth_token":       auth_token,
        "delivery_needed":  False,
        "amount_cents":     amount_cents,
        "currency":         "EGP",
        "merchant_order_id": unique_moid,
        "items": [
            {
                "name":        f"Order #{order_id}",
                "amount_cents": amount_cents,
                "description": "Order payment",
                "quantity":    1
            }
        ]
    }
    logger.info(f"Registering Paymob order: {payload}")

    #Send request and handle duplicates gracefully
    response = requests.post(settings.PAYMOB_ORDER_URL, json=payload)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        error_json = response.json()
        #FIXME: Specific handling for duplicate merchant_order_id
        if response.status_code == 422 and error_json.get("message") == "duplicate":
            logger.warning(f"Duplicate merchant_order_id '{unique_moid}' detected.")
            # NOTE: Look up existing Paymob order or rethrow
            raise
        # Log and rethrow for all other errors
        logger.error(f"Paymob API error {response.status_code}: {response.text}")
        raise

    data = response.json()
    paymob_id = data.get("id")
    logger.info(f"Paymob order registered successfully, ID: {paymob_id}")
    return paymob_id

def get_payment_key(order_id: str, amount_cents: int, auth_token: str, billing_data: dict) -> str:
    """Generate a payment key for the order with dynamic billing data"""
    # Ensure all required billing fields have values
    required_fields = ["first_name", "last_name", "email", "phone_number"]
    for field in required_fields:
        if not billing_data.get(field):
            billing_data[field] = "NA" if field != "email" else "customer@example.com"

    # Convert integration_id to integer
    integration_id = int(settings.PAYMOB_INTEGRATION_ID)

    # Build the payload
    payload = {
        "auth_token": auth_token,
        "amount_cents": amount_cents,
        "expiration": 3600,
        "order_id": order_id,
        "billing_data": billing_data,
        "currency": "EGP",
        "integration_id": integration_id
    }

    logger.info(f"Payment key request payload: {payload}")

    response = requests.post(
        settings.PAYMOB_PAYMENT_KEY_URL,
        json=payload
    )

    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        logger.error(f"PayMob API error: {response.text}")
        raise

    return response.json()["token"]

def build_billing_data(order):
    """Extract billing data from an Order instance with fallback values."""
    user = order.user

    return {
        "email": user.email if user else "customer@example.com",
        "first_name": user.first_name if user else "Customer",
        "last_name": user.last_name if user else "Name",
        "phone_number": getattr(order, "phone", "+201000000000"),
        "apartment": "NA",
        "floor": "NA",
        "street": getattr(order, "shipping_address", "NA"),
        "building": "NA",
        "shipping_method": "NA",
        "postal_code": "NA",
        "city": "NA",
        "country": "EG",  # Set a default country code
        "state": "NA"
    }
