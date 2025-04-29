import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Image } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart, faArrowLeft, faTag } from '@fortawesome/free-solid-svg-icons';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Handle quantity change
  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) quantity = 1;
    dispatch(updateQuantity({ id, quantity: parseInt(quantity) }));
  };

  // Handle remove item
  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  // Apply coupon code (mock functionality)
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toLowerCase() === 'discount10') {
      setDiscount(totalAmount * 0.1);
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
      alert('Invalid coupon code');
    }
  };

  // Calculate final amount
  const finalAmount = totalAmount - discount;

  // Handle checkout
  const handleCheckout = () => {
    // Navigate to checkout page or process payment
    alert('Proceeding to checkout...');
    // navigate('/checkout');
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4 fw-bold" style={{ color: '#660ff1' }}>Shopping Cart</h1>
      
      {items.length === 0 ? (
        <Card className="p-5 text-center shadow-sm">
          <Card.Body>
            <FontAwesomeIcon icon={faShoppingCart} size="3x" className="mb-3 text-muted" />
            <h3>Your cart is empty</h3>
            <p className="text-muted">Looks like you haven't added any products to your cart yet.</p>
            <Link to="/shop">
              <Button variant="primary" style={{ backgroundColor: '#660ff1', border: 'none' }}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Continue Shopping
              </Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0">Cart Items ({items.length})</h5>
              </Card.Header>
              <Card.Body>
                {items.map((item) => (
                  <Row key={item.id} className="mb-4 border-bottom pb-4">
                    <Col xs={3} md={2}>
                      <Image 
                        src={item.image || '/placeholder-image.jpg'} 
                        alt={item.title} 
                        fluid 
                        rounded 
                        className="shadow-sm"
                        style={{ height: '80px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </Col>
                    <Col xs={9} md={5}>
                      <h6 className="mb-1">{item.title}</h6>
                      <p className="text-muted small mb-1">
                        {item.category_name && `Category: ${item.category_name}`}
                      </p>
                      <p className="fw-bold mb-0" style={{ color: '#660ff1' }}>
                        ${item.price}
                      </p>
                    </Col>
                    <Col xs={6} md={3} className="d-flex align-items-center">
                      <Form.Group className="d-flex align-items-center">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="mx-2 text-center"
                          style={{ width: '60px' }}
                        />
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={2} className="d-flex align-items-center justify-content-end">
                      <div className="d-flex flex-column align-items-end">
                        <span className="fw-bold mb-2">${(item.price * item.quantity).toFixed(2)}</span>
                        <Button 
                          variant="link" 
                          className="text-danger p-0" 
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </Button>
                      </div>
                    </Col>
                  </Row>
                ))}
                
                <div className="d-flex justify-content-between mt-3">
                  <Link to="/shop">
                    <Button variant="outline-primary">
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your cart?')) {
                        dispatch(clearCart());
                      }
                    }}
                  >
                    Clear Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                
                {couponApplied && (
                  <div className="d-flex justify-content-between mb-3 text-success">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-4 pt-2 border-top">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold" style={{ color: '#660ff1' }}>
                    ${finalAmount.toFixed(2)}
                  </span>
                </div>
                
                <Form onSubmit={handleApplyCoupon} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Apply Coupon</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button 
                        type="submit" 
                        variant="outline-primary" 
                        className="ms-2"
                        disabled={!couponCode}
                      >
                        <FontAwesomeIcon icon={faTag} className="me-1" />
                        Apply
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Try "DISCOUNT10" for 10% off
                    </Form.Text>
                  </Form.Group>
                </Form>
                
                <Button 
                  variant="primary" 
                  className="w-100 py-2" 
                  onClick={handleCheckout}
                  style={{ backgroundColor: '#660ff1', border: 'none' }}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Card.Body>
            </Card>
            
            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Secure Checkout</h6>
                <p className="small text-muted mb-0">
                  We use secure transmission and encrypted storage to protect your personal information.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Cart;
