import React from 'react';
import Iframe from 'react-iframe';
import { Spinner } from 'react-bootstrap';

const PaymentIframe = ({ iframeId, paymentKey, onClose, isLoading }) => {
  const iframeUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

  return (
    <div className="payment-iframe-overlay">
      <div className="payment-iframe-container">
        <div className="iframe-header">
          <h4>Complete Your Payment</h4>
          <button onClick={onClose} className="btn-close" aria-label="Close"></button>
        </div>

        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading payment gateway...</span>
            </Spinner>
            <p className="mt-3">Connecting to payment gateway...</p>
          </div>
        ) : (
          <div className="iframe-wrapper">
            <Iframe
              url={iframeUrl}
              width="100%"
              height="600px"
              id="paymob-iframe"
              className="payment-iframe"
              display="block"
              position="relative"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentIframe;