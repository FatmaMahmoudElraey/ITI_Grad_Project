import React, { useState } from 'react';
import { Card, Badge, Button, Stack, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import '../styles/TemplateCard.css';
import { addToCart } from '../store/slices/cartSlice';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: id,
      template_id: id,
      quantity: 1,
      price: sale_price || price,
      title,
      image: images && images.length > 0 ? images[0].image : null,
      category_name
    }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
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
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" delay={2000} autohide>
          <Toast.Header closeButton>
            <FiShoppingCart className="me-2" />
            <strong className="me-auto">Added to Cart</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {title} has been added to your cart.
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
          src={images && images.length > 0 ? images[0].image : '/placeholder-image.jpg'}
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