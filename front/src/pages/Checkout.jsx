import React, { useState, useEffect } from 'react';
import '../assets/css/checkout/style.css';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCreditCard, faMoneyBill, faCheckCircle, faArrowLeft, faExclamationTriangle, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/cartApiSlice';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);
  const [validated, setValidated] = useState(false);
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Egypt',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2) {
      // Process payment and place order
      processOrder();
    }
  };

  // Check authentication status and restore form data on mount
  useEffect(() => {
    // Restore form data from localStorage if available
    const savedFormData = localStorage.getItem('checkoutFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prevData => ({
          ...prevData,
          ...parsedData
        }));
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    // Check if we just returned from login
    const params = new URLSearchParams(location.search);
    if (params.get('from') === 'login' && isAuthenticated) {
      setApiSuccess('Login successful! You can now complete your checkout.');
      // Clear the query parameter
      navigate('/checkout', { replace: true });
    }
  }, [location, navigate, isAuthenticated]);

  // Update form data with user information if available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        firstName: user.first_name || prevData.firstName,
        lastName: user.last_name || prevData.lastName,
        email: user.email || prevData.email,
        // Add other user data if available
      }));
    }
  }, [user]);

  // Process order
  const processOrder = () => {
    setLoading(true);
    setError(null);
    
    // Generate a display order number for non-authenticated users
    const displayOrderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    
    // Calculate order totals
    const subtotal = totalAmount;
    const shipping = 10.00;
    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + shipping + tax;
    
    // Create shipping address string
    const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`;
    
    if (isAuthenticated) {
      // For authenticated users, save order to database
      console.log('Creating order in database for authenticated user');
      
      // First, check if we have items in the cart
      if (!items || items.length === 0) {
        console.error('Cannot create order: No items in cart');
        setError('Your cart is empty. Please add items before checking out.');
        setLoading(false);
        return;
      }
      
      // The backend will automatically use the user's cart items to create the order
      dispatch(createOrder({
        payment_status: 'P' // Pending status
      }))
        .unwrap()
        .then(orderResponse => {
          console.log('Order created successfully:', orderResponse);
          // Set the order number from the response
          setOrderNumber(orderResponse.id);
          
          // Clear cart after successful order
          dispatch(clearCart());
          setOrderPlaced(true);
          window.scrollTo(0, 0);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error creating order:', err);
          setError(typeof err === 'string' ? err : 'An error occurred while processing your order. Please try again.');
          setLoading(false);
        });
    } else {
      // For non-authenticated users, just use local storage
      console.log('Creating local order for non-authenticated user');
      setOrderNumber(displayOrderNumber);
      
      // Create order object for local storage
      const order = {
        id: displayOrderNumber,
        items: items,
        shipping_address: shippingAddress,
        payment_status: 'P', // Pending
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        created_at: new Date().toISOString()
      };
      
      // Save to local storage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Clear cart
      dispatch(clearCart());
      
      // Show success
      setOrderPlaced(true);
      window.scrollTo(0, 0);
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step === 2) {
      setStep(1);
      window.scrollTo(0, 0);
    } else {
      navigate('/cart');
    }
  };

  // Go to home page after order completion
  const goToHome = () => {
    navigate('/');
  };

  // Calculate order summary
  const subtotal = totalAmount;
  const shipping = 10.00;
  const tax = subtotal * 0.14; // 14% VAT
  const total = subtotal + shipping + tax;

  // Authentication notice for users who aren't logged in
  const renderAuthNotice = () => {
    if (!isAuthenticated) {
      return (
        <Alert variant="warning" className="mb-4">
          <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
          <strong>You're not logged in.</strong> Please{' '}
          <Button 
            variant="link" 
            className="p-0 mx-1"
            onClick={() => {
              localStorage.setItem('checkoutFormData', JSON.stringify(formData));
              navigate('/login?redirect=checkout');
            }}
          >
            log in
          </Button>
          {' '}to save your order history and track your purchases.
        </Alert>
      );
    }
    return null;
  };

  // If cart is empty and not in order confirmation, redirect to cart
  if (items.length === 0 && !orderPlaced) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Your cart is empty. Please add items to your cart before checkout.
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate('/shop')}
          style={{ backgroundColor: '#660ff1', border: 'none' }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  // Order confirmation screen
  if (orderPlaced) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-5 text-center">
            <div className="mb-4">
              <FontAwesomeIcon 
                icon={faCheckCircle} 
                size="4x" 
                className="text-success mb-3" 
              />
              <h2 className="mb-3">Thank You for Your Order!</h2>
              <p className="lead mb-1">Your order has been placed successfully.</p>
              <p className="mb-4">Order Number: <strong>{orderNumber}</strong></p>
              <Alert variant="info" className="d-inline-block">
                A confirmation email has been sent to {formData.email}
              </Alert>
            </div>
            
            <Row className="mt-5 justify-content-center">
              <Col md={8} lg={6}>
                <Card className="mb-4">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Order Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>${shipping.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tax (14%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between pt-2 border-top fw-bold">
                      <span>Total:</span>
                      <span className="fw-bold" style={{ color: '#660ff1' }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate('/shop')}
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={goToHome}
                    style={{ backgroundColor: '#660ff1', border: 'none' }}
                  >
                    Go to Home
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Main checkout content
  return (
    <Container className="py-5">
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" style={{ color: '#660ff1' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Processing your order...</p>
        </div>
      ) : (
        <>
          <h1 className="mb-4 fw-bold" style={{ color: '#660ff1' }}>Checkout</h1>
          
          {/* Success message */}
          {apiSuccess && (
            <Alert variant="success" className="mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              {apiSuccess}
            </Alert>
          )}
          
          {/* Error message */}
          {error && (
            <Alert variant="danger" className="mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {error}
            </Alert>
          )}
          
          {/* Authentication notice */}
          {renderAuthNotice()}
          
          {/* Checkout Steps */}
          <div className="d-flex justify-content-center mb-4">
            <div className="position-relative checkout-steps">
              <div className="step-item active">
                <div className="step-circle">1</div>
                <div className="step-title">Shipping</div>
              </div>
              <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-title">Payment</div>
              </div>
              <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-title">Confirmation</div>
              </div>
            </div>
          </div>
          
          <Row>
            <Col lg={8}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-4">
                  {step === 1 && (
                    <>
                      <h4 className="mb-4">Shipping Information</h4>
                      <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your first name.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your last name.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide a valid email.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your phone number.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide your address.
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>City</Form.Label>
                              <Form.Control
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your city.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>State/Province</Form.Label>
                              <Form.Control
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your state/province.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Zip/Postal Code</Form.Label>
                              <Form.Control
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please provide your zip/postal code.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Country</Form.Label>
                              <Form.Select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                              >
                                <option value="Egypt">Egypt</option>
                                <option value="United States">United States</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="Canada">Canada</option>
                                <option value="Australia">Australia</option>
                                <option value="Germany">Germany</option>
                                <option value="France">France</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="d-flex justify-content-between mt-4">
                          <Button 
                            variant="outline-secondary" 
                            onClick={goBack}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Back to Cart
                          </Button>
                          <Button 
                            type="submit" 
                            variant="primary"
                            style={{ backgroundColor: '#660ff1', border: 'none' }}
                          >
                            Continue to Payment
                          </Button>
                        </div>
                      </Form>
                    </>
                  )}
                  
                  {step === 2 && (
                    <>
                      <h4 className="mb-4">Payment Method</h4>
                      <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Form.Group className="mb-4">
                          <div className="payment-methods">
                            <Form.Check
                              type="radio"
                              id="credit-card"
                              name="paymentMethod"
                              value="credit-card"
                              label={
                                <span>
                                  <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                                  Credit/Debit Card
                                </span>
                              }
                              checked={formData.paymentMethod === 'credit-card'}
                              onChange={handleChange}
                              className="mb-3"
                            />
                            
                            <Form.Check
                              type="radio"
                              id="cash-on-delivery"
                              name="paymentMethod"
                              value="cash-on-delivery"
                              label={
                                <span>
                                  <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
                                  Cash on Delivery
                                </span>
                              }
                              checked={formData.paymentMethod === 'cash-on-delivery'}
                              onChange={handleChange}
                            />
                          </div>
                        </Form.Group>
                        
                        {formData.paymentMethod === 'credit-card' && (
                          <div className="credit-card-form p-3 border rounded mb-4">
                            <Row>
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Card Number</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    placeholder="1234 5678 9012 3456"
                                    required={formData.paymentMethod === 'credit-card'}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Please provide your card number.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <Row>
                              <Col md={12}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Name on Card</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="cardName"
                                    value={formData.cardName}
                                    onChange={handleChange}
                                    required={formData.paymentMethod === 'credit-card'}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Please provide the name on your card.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                            </Row>
                            
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Expiry Date</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    placeholder="MM/YY"
                                    required={formData.paymentMethod === 'credit-card'}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Please provide your card's expiry date.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>CVV</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleChange}
                                    placeholder="123"
                                    required={formData.paymentMethod === 'credit-card'}
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    Please provide your card's CVV.
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                            </Row>
                          </div>
                        )}
                        
                        <div className="d-flex justify-content-between mt-4">
                          <Button 
                            variant="outline-secondary" 
                            onClick={goBack}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                            Back to Shipping
                          </Button>
                          <Button 
                            type="submit" 
                            variant="primary"
                            style={{ backgroundColor: '#660ff1', border: 'none' }}
                          >
                            Place Order
                          </Button>
                        </div>
                      </Form>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0">Order Summary</h5>
                </Card.Header>
                <Card.Body>
                  <div className="order-items mb-3">
                    {items.map((item) => (
                      <div key={item.id} className="d-flex justify-content-between mb-2">
                        <div>
                          <span className="fw-medium">{item.title}</span>
                          <small className="text-muted d-block">Qty: {item.quantity}</small>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span>Tax (14%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between pt-2 border-top">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold" style={{ color: '#660ff1' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </Card.Body>
              </Card>
              
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <FontAwesomeIcon icon={faLock} className="me-2 text-success" />
                    <h6 className="mb-0">Secure Checkout</h6>
                  </div>
                  <p className="small text-muted mb-0">
                    We use secure transmission and encrypted storage to protect your personal information and payment details.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Checkout;
