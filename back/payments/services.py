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

    # Extract order ID - PayMob sends it as nested dict in webhook
    order_value = data.get('order', '')
    if isinstance(order_value, dict):
        order_id = order_value.get('id', '')
    else:
        order_id = order_value

    # PayMob concatenates these fields in this exact order
    concatenated_string = (
        str(data.get('amount_cents', '')) +
        str(data.get('created_at', '')) +
        str(data.get('currency', '')) +
        str(data.get('error_occured', '')) +
        str(data.get('has_parent_transaction', '')) +
        str(data.get('id', '')) +
        str(data.get('integration_id', '')) +
        str(data.get('is_3d_secure', '')) +
        str(data.get('is_auth', '')) +
        str(data.get('is_capture', '')) +
        str(data.get('is_refunded', '')) +
        str(data.get('is_standalone_payment', '')) +
        str(data.get('is_voided', '')) +
        str(order_id) +  # Use extracted order ID, not the full dict
        str(data.get('owner', '')) +
        str(data.get('pending', '')) +
        str(get_nested(data, 'source_data', 'pan')) +
        str(get_nested(data, 'source_data', 'sub_type')) +
        str(get_nested(data, 'source_data', 'type')) +
        str(data.get('success', ''))
    )

    # Compute HMAC using your secret key
    computed = hmac.new(
        settings.PAYMOB_HMAC_KEY.encode('utf-8'),
        concatenated_string.encode('utf-8'),
        hashlib.sha512
    ).hexdigest()

    # Log for debugging
    logger.info("=" * 80)
    logger.info("HMAC VERIFICATION")
    logger.info("=" * 80)
    logger.info(f"Order value type: {type(order_value)}")
    logger.info(f"Extracted order ID: {order_id}")
    logger.info(f"Concatenated String (first 150 chars): {concatenated_string[:150]}...")
    logger.info(f"Computed HMAC: {computed}")
    logger.info(f"Received HMAC: {signature}")
    logger.info(f"Match: {hmac.compare_digest(computed, signature)}")
    logger.info("=" * 80)

    return hmac.compare_digest(computed, signature)

def process_payment_event(data: dict) -> None:
    """
    Update the Payment record based on the Paymob webhook event.
    """
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

def handle_webhook(request) -> dict:
    """
    Orchestrates verification and processing of a Paymob webhook.
    Returns a dict with 'success' and 'message'.
    """
    # PayMob sends HMAC in query parameter
    signature = request.GET.get('hmac', '')

    # Parse the JSON data
    try:
        raw_data = request.data  # DRF parsed JSON

        # Log the complete webhook payload for debugging
        logger.info("=" * 80)
        logger.info("WEBHOOK RECEIVED - RAW DATA")
        logger.info("=" * 80)
        logger.info(f"Raw data type: {type(raw_data)}")
        logger.info(f"Raw data keys: {raw_data.keys() if isinstance(raw_data, dict) else 'N/A'}")
        logger.info(f"Full raw data:\n{json.dumps(raw_data, indent=2, default=str)}")
        logger.info("=" * 80)

        # PayMob wraps transaction data in 'obj' key
        if isinstance(raw_data, dict) and 'obj' in raw_data:
            data = raw_data['obj']
            logger.info("Found 'obj' key in webhook data")
        elif isinstance(raw_data, dict) and 'type' in raw_data:
            # Some PayMob webhooks have 'type' and 'obj' structure
            data = raw_data.get('obj', raw_data)
            logger.info("Using webhook data from 'obj' or root")
        else:
            data = raw_data
            logger.info("Using raw data directly (no 'obj' wrapper)")

        logger.info(f"Transaction data keys: {data.keys() if isinstance(data, dict) else 'N/A'}")
        logger.info(f"Transaction data:\n{json.dumps(data, indent=2, default=str)}")

    except Exception as e:
        logger.error(f"Failed to parse webhook JSON: {e}")
        return {'success': False, 'message': 'Invalid JSON'}

    # 1) Signature verification
    if not verify_webhook_signature(data, signature):
        logger.warning("Invalid webhook signature")
        # Log the raw data for debugging HMAC issues
        logger.error(f"HMAC mismatch details:")
        logger.error(f"  amount_cents: {data.get('amount_cents')}")
        logger.error(f"  created_at: {data.get('created_at')}")
        logger.error(f"  order: {data.get('order')}")
        logger.error(f"  success: {data.get('success')}")
        logger.error(f"  source_data: {data.get('source_data')}")
        return {'success': False, 'message': 'Invalid signature'}

    logger.info("Webhook signature verified successfully")

    # 2) Delegate to event processor
    try:
        process_payment_event(data)
        logger.info("Payment event processed successfully")
    except Exception as e:
        logger.exception(f"Error processing webhook: {e}")
        return {'success': False, 'message': 'Error processing event'}

    return {'success': True, 'message': 'Webhook processed'}

def get_paymob_auth_token():
    """Get authentication token from Paymob API"""
    try:
        response = requests.post(
            "https://accept.paymobsolutions.com/api/auth/tokens",
            json={"api_key": settings.PAYMOB_API_KEY}
        )
        response.raise_for_status()  # Raise exception for HTTP errors
        return response.json()["token"]
    except ConnectionError as e:
        # Handle connection issues specifically
        raise APIException(
            detail="Payment service unavailable. Please check your internet connection and try again.",
            code=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Timeout:
        # Handle timeout issues
        raise APIException(
            detail="Payment service timed out. Please try again later.",
            code=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except RequestException as e:
        # Handle all other request issues
        raise APIException(
            detail="Error connecting to payment service. Please try again later.",
            code=status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        # Catch any other unexpected errors
        raise APIException(
            detail="Unexpected error processing payment. Please try again later.",
            code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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
