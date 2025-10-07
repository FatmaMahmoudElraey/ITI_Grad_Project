import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { loadUser } from '../store/slices/authSlice'; // Import this
import Swal from 'sweetalert2';
import axios from 'axios';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract query parameters
  const params = new URLSearchParams(location.search);
  const status = params.get('status');
  const txnId = params.get('txn_id');
  const orderId = params.get('order');

  // Check if payment was successful
  const isSuccess = status === 'true';

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get payment ID from localStorage
        let paymentId = localStorage.getItem('last_payment_id');

        // If no paymentId but we have txnId and orderId from URL params, we can still proceed
        if (!paymentId && txnId && orderId) {
          console.log("No payment ID in localStorage, but we have txnId and orderId from URL");

          // In this case, we don't need to confirm the payment again since the backend already did
          // Just restore auth if needed and show success message

          // Clear the cart
          dispatch(clearCart());

          // Show success message
          if (isSuccess) {
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Thank you for your purchase! Your order has been processed successfully.',
              confirmButtonColor: '#660ff1'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: 'There was an issue processing your payment. Please try again.',
              confirmButtonColor: '#660ff1'
            });
          }

          setLoading(false);
          return;
        }

        // Original code for when we have the payment ID
        if (!paymentId || !txnId) {
          setError('Missing payment information');
          setLoading(false);
          return;
        }

        // Call the backend confirm endpoint; server will use cookies for auth
        await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/payments/confirm/`, {
          payment_id: paymentId,
          transaction_id: txnId,
          status: isSuccess ? 'paid' : 'failed'
        });

        // Show success/error alert
        if (isSuccess) {
          // Clear the cart
          dispatch(clearCart());

          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Thank you for your purchase! Your order has been processed successfully.',
            confirmButtonColor: '#660ff1'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: 'There was an issue processing your payment. Please try again.',
            confirmButtonColor: '#660ff1'
          });
        }

        // Clean up localStorage
        localStorage.removeItem('last_payment_id');
        localStorage.removeItem('last_payment_order_id');
      } catch (err) {
        console.error('Error in payment result:', err);
        setError('Failed to process payment result');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [dispatch, isSuccess, txnId, orderId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Processing payment result...</span>
        </Spinner>
        <p className="mt-3">Processing your payment information...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4 text-center">
          {error ? (
            <Alert variant="danger">
              {error}
            </Alert>
          ) : isSuccess ? (
            <>
              <div className="mb-4">
                <i className="fas fa-check-circle text-success fa-4x mb-3"></i>
                <h2>Payment Successful!</h2>
                <p className="lead">Your order has been processed successfully.</p>
                {orderId && <p>Order Number: <strong>{orderId}</strong></p>}
              </div>
              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate('/shop')}
                  className="mx-2"
                >
                  Continue Shopping
                </Button>
                {/* <Button
                  variant="primary"
                  onClick={() => navigate('/account/orders')}
                  style={{ backgroundColor: '#660ff1', border: 'none' }}
                  className="mx-2"
                >
                  View My Orders
                </Button> */}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <i className="fas fa-times-circle text-danger fa-4x mb-3"></i>
                <h2>Payment Failed</h2>
                <p className="lead">We couldn't process your payment.</p>
                <p>Please try again or contact customer support.</p>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/checkout')}
                style={{ backgroundColor: '#660ff1', border: 'none' }}
              >
                Try Again
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentResult;