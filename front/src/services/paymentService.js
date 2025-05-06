import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const preserveAuthTokens = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (accessToken) {
    localStorage.setItem("payment_access_token", accessToken);
    localStorage.setItem("payment_in_progress", "true");

    if (refreshToken) {
      localStorage.setItem("payment_refresh_token", refreshToken);
    }
    console.log("Auth tokens preserved for payment process");
  }
};

export const createPaymentSession = async (orderId, amountCents) => {
  // Save authentication before potentially leaving the site
  preserveAuthTokens();

  // Store order ID for later reference
  localStorage.setItem("last_payment_order_id", orderId);

  // Use sessionStorage instead of localStorage
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await axios.post(
      `${API_URL}/payments/create-session/`,
      {
        order_id: orderId,
        amount_cents: amountCents
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment session creation error:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentId, transactionId, status) => {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await axios.post(
      `${API_URL}/payments/confirm/`,
      {
        payment_id: paymentId,
        transaction_id: transactionId,
        status: status
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment confirmation error:', error);
    throw error;
  }
};