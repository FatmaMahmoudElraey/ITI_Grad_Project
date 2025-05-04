import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const createPaymentSession = async (orderId, amountCents) => {
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