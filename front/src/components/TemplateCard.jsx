import React, { useState } from 'react';
import { Card, Badge, Button, Stack } from 'react-bootstrap';
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
    photo,
    category_name,
    tags_names = []
  } = product;
  
  // Debug image structure
  const [isFavorite, setIsFavorite] = useState(false);
  // Removed toast state variables as we're using SweetAlert instead
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
    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Show SweetAlert notification with login button
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to add items to your cart.',
        showCancelButton: true,
        confirmButtonColor: '#660ff1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to login page
          navigate('/login');
        }
      });
      return; // Stop further execution
    }

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
      image: photo || null,
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
          // Show success SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Added to Cart!',
            text: `${title} has been added to your cart.`,
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            timerProgressBar: true
          });
        })
        .catch(error => {
          console.error('Failed to save cart item to database:', error);
          // Show warning SweetAlert
          Swal.fire({
            icon: 'warning',
            title: 'Partially Added',
            text: `${title} added to local cart only. Database sync failed.`,
            timer: 3000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            timerProgressBar: true
          });
        });
    } else {
      // For non-authenticated users, just show a success message
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart!',
        text: `${title} has been added to your cart.`,
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        timerProgressBar: true
      });
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
      <Card className="h-100 border-0 shadow-md hover-shadow transition" style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={photo || '/placeholder-image.jpg'}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            if (!e.target.getAttribute('data-error-handled')) {
              e.target.setAttribute('data-error-handled', 'true');
              e.target.src = '/placeholder-image.jpg';
            }
          }}
        />

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
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            zIndex: 2
          }}
        >
          <FiHeart 
            size={20} 
            fill={isFavorite ? '#dc3545' : 'none'}
            stroke={isFavorite ? '#dc3545' : '#000'}
          />
        </Button>
      </div>

      <Card.Body className="d-flex flex-column" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title as="h5" className="mb-0">{title}</Card.Title>
        </div>

        <div className="mb-2 d-flex align-items-center">
          <span className="me-2">{renderStars(averageRating)}</span>
          <small className="text-muted">({reviews.length} reviews)</small>
        </div>

        <Card.Text className="text-muted small mb-3" style={{ minHeight: '3rem', maxHeight: '3rem', overflow: 'hidden' }}>
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
          <div className="d-flex justify-content-between gap-2 mb-3">
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

            <Link to={`/product-details/${id}`} className="text-decoration-none mb-2">
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
            className='btn btn-success fw-bold'
              variant="primary"
              onClick={handleAddToCart}
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