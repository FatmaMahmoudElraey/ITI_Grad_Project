import React, { useState } from 'react';
import { Card, Badge, Button, Stack, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { BASE_URL } from '../api/constants';
import '../styles/TemplateCard.css';
import { addToCart } from '../store/slices/cartSlice';
import { addCartItem } from '../store/slices/cartApiSlice';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const TemplateCard = (product) => {
  // Extract properties from product with defaults
  const {
    id,
    title,
    description,
    price,
    sale_price,
    reviews = [],
    images = [],
    category_name,
    tags_names = []
  } = product;
  
  // Debug image structure
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    // Check if the item already exists in the cart (using Redux state)
    const itemExists = cartItems.some(item => item.id === id || item.template_id === id);

    if (itemExists) {
      // Show SweetAlert notification if item is already in cart
      Swal.fire({
        icon: 'info',
        title: 'Already in Cart',
        text: `${title} is already in your cart.`,
        timer: 2000, // Auto close after 2 seconds
        showConfirmButton: false
      });
      return; // Stop further execution
    }

    // Create cart item object for local state
    const cartItem = {
      id: id,
      template_id: id,
      quantity: 1,
      price: sale_price || price,
      title,
      image: images && images.length > 0 ? (images[0].image_url || images[0].image || null) : null,
      category_name
    };
    
    // Add to local cart state
    dispatch(addToCart(cartItem));
    
    // If user is authenticated, also save to database
    if (isAuthenticated) {
      console.log('Adding item to database cart:', {
        product_id: id,
        quantity: 1
      });
      
      // Create a database-compatible cart item
      const dbCartItem = {
        product_id: id,
        quantity: 1
      };
      
      // The improved addCartItem function will handle duplicates automatically
      dispatch(addCartItem(dbCartItem))
        .unwrap()
        .then(response => {
          console.log('Successfully added/updated cart item in database:', response);
          setToastMessage(`${title} has been added to your cart.`);
          setToastVariant('success');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        })
        .catch(error => {
          console.error('Failed to save cart item to database:', error);
          setToastMessage(`${title} added to local cart only. Database sync failed.`);
          setToastVariant('warning');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 2000);
        });
    } else {
      // For non-authenticated users, just show a success message
      setToastMessage(`${title} has been added to your cart.`);
      setToastVariant('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className="text-warning">
        <FiStar 
          size={14} 
          fill={index < Math.round(rating) ? 'currentColor' : 'none'}
        />
      </span>
    ));
  };

  return (
    <>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg={toastVariant} delay={2000} autohide>
          <Toast.Header closeButton>
            <FiShoppingCart className="me-2" />
            <strong className="me-auto">Added to Cart</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
            <div className="mt-2">
              <Button size="sm" variant="light" onClick={() => navigate('/cart')}>
                View Cart
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Card className="h-100 border-0 shadow-sm hover-shadow transition">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={images && images.length > 0 ? (images[0].image_url || images[0].image || `/placeholder-image.jpg`) : '/placeholder-image.jpg'}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            if (!e.target.getAttribute('data-error-handled')) {
              e.target.setAttribute('data-error-handled', 'true');
              e.target.src = '/placeholder-image.jpg';
            }
          }}
        />
        {category_name && (
          <Badge 
            bg="primary" 
            className="position-absolute top-0 start-0 m-2"
          >
            {category_name}
          </Badge>
        )}

        {sale_price && sale_price < price && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2"
          >
            Save ${(price - sale_price).toFixed(0)}
          </Badge>
        )}

        <Button
          variant="link"
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          <FiHeart 
            size={24} 
            fill={isFavorite ? '#dc3545' : 'none'}
            stroke={isFavorite ? '#dc3545' : '#fff'}
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
          />
        </Button>
      </div>

      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title as="h5" className="mb-0">{title}</Card.Title>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <span className="me-2">{renderStars(averageRating)}</span>
          <small className="text-muted">({reviews.length} reviews)</small>
        </div>

        <Card.Text className="text-muted small mb-3" style={{ minHeight: '3rem' }}>
          {description?.length > 100 
            ? `${description.substring(0, 100)}...` 
            : description}
        </Card.Text>

        <Stack direction="horizontal" gap={1} className="mb-3 flex-wrap">
          {tags_names && tags_names.map((tag, index) => (
            <Badge 
              key={`${id}-${index}`} 
              bg="light" 
              text="dark" 
              className="me-1 mb-1"
            >
              {tag}
            </Badge>
          ))}
        </Stack>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {sale_price ? (
                <>
                  <span className="text-decoration-line-through text-muted me-2">
                    ${price}
                  </span>
                  <span className="fs-5 fw-bold text-danger">
                    ${sale_price}
                  </span>
                </>
              ) : (
                <span className="fs-5 fw-bold" style={{ color: '#660ff1' }}>
                  ${price}
                </span>
              )}
            </div>

            <Link to={`/product-details/${id}`} className="text-decoration-none">
              <Button
                variant="outline-primary"
                size="sm"
              >
                Preview
              </Button>
            </Link>
          </div>

          <div className="d-grid">
            <Button
              variant="primary"
              onClick={handleAddToCart}
              style={{ backgroundColor: '#660ff1', border: 'none' }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
    </>
  );
};

export default TemplateCard;