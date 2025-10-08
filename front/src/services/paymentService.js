import axios from 'axios';
import { BASE_URL } from '../api/constants';

const API_URL = BASE_URL;

export const preserveAuthTokens = () => {
  // No-op: with cookie-based auth we don't copy tokens to localStorage.
  // Keep this function as a noop for compatibility.
  console.log('preserveAuthTokens called (noop under cookie-based auth)');
};

export const createPaymentSession = async (orderId, amountCents) => {
  // Store order ID for later reference
  localStorage.setItem("last_payment_order_id", orderId);

  try {
    // Rely on cookies for authentication (axios defaults set withCredentials)
    const response = await axios.post(`${API_URL}/api/payments/create-session/`, {
      order_id: orderId,
      amount_cents: amountCents
    });

    return response.data;
  } catch (error) {
    console.error('Payment session creation error:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentId, transactionId, status) => {
  try {
    const response = await axios.post(`${API_URL}/api/payments/confirm/`, {
      payment_id: paymentId,
      transaction_id: transactionId,
      status: status
    });

    return response.data;
  } catch (error) {
    console.error('Payment confirmation error:', error);
    throw error;
  }
};