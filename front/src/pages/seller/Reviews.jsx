import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { fetchSellerProductReviews } from '../../store/slices/productReviewsSlice';
import { loadUser } from "../../store/slices/authSlice";
import Sidebar from "../../components/Seller/Sidebar";
import "../../assets/css/dashboard/dash.css";

export default function Reviews() {
  const dispatch = useDispatch();
  const { items: reviews, loading, error } = useSelector(state => state.productReviews);
  const { user } = useSelector(state => state.auth);

  // Load user data if not already loaded
  useEffect(() => {
    if (!user) {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Fetch reviews for seller's products
  useEffect(() => {
    if (user && user.id) {
      dispatch(fetchSellerProductReviews());
    }
  }, [dispatch, user]);


  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star-filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star-half">★</span>);
      } else {
        stars.push(<span key={i} className="star-empty">★</span>);
      }
    }
    
    return <div className="rating-stars">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main loading-container">
          <div className="loading-container">  <div className="loading-spinner"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main error-container">
          <div className="error-content">
            {error}
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary ms-2"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Product Reviews</h1>
          <Link to="/seller/products" className="button primary-button">
            Back to Products
          </Link>
        </div>

        <div className="card data-table-container">
          {!Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews available for your products yet.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => {
                const product = review.productDetails;
                return (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <h3 className="review-product">
                        {product ? (product.name || product.title) : `Product #${review.product}`}
                      </h3>
                      <span className="review-date">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                    <div className="review-customer">
                      <strong>Customer:</strong> {review.user || 'Anonymous'}
                    </div>
                    <div className="review-rating">
                      {renderRatingStars(review.rating)}
                      <span className="rating-value">{review.rating}/5</span>
                    </div>
                    <div className="review-comment">
                      <p>{review.comment || review.content || 'No comment provided'}</p>
                    </div>
                    {product && (
                      <div className="review-product-info">
                        <span className="product-category">
                          {product.category_name || product.category || 'Uncategorized'}
                        </span>
                        <span className="product-price">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}