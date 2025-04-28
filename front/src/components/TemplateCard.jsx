import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import '../styles/TemplateCard.css';

const TemplateCard = ({ id, title, description, price, sale_price, preview_image }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={preview_image || '/placeholder-image.jpg'} // Use local placeholder image
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            if (!e.target.getAttribute('data-error-handled')) {
              e.target.setAttribute('data-error-handled', 'true');
              e.target.src = '/placeholder-image.jpg'; // Fallback to local image
            }
          }}
        />
        <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center">
          <Button
            variant="link"
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <FaHeart 
              size={24} 
              color={isFavorite ? '#dc3545' : '#fff'}
              style={{ 
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4)'
              }}
            />
          </Button>
          {sale_price && (
            <span className="badge bg-danger position-absolute top-0 start-0 m-2">
              Sale
            </span>
          )}
        </div>
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 mb-2">{title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {description?.substring(0, 80)}...
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            {sale_price ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-decoration-line-through text-muted small">
                  ${price}
                </span>
                <span className="h6 mb-0 text-danger">
                  ${sale_price}
                </span>
              </div>
            ) : (
              <span className="h6 mb-0" style={{ color: '#660ff1' }}>
                ${price}
              </span>
            )}
          </div>
          <Link to={`/template/${id}`}>
            <Button 
              variant="primary"
              style={{ backgroundColor: '#660ff1', border: 'none' }}
            >
              View Details
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TemplateCard;