import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import "../../assets/css/dashboard/dash.css";
import dashboardData from "../../assets/data/dashboardData.json";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch this from an API
        // For now, we'll use mock data linked to popularProducts
        const fetchedReviews = [
          {
            id: 1,
            productId: 1, // Linking to Wireless Headphones
            customer: "Alex Johnson",
            rating: 4.5,
            comment: "Excellent noise cancellation! Battery life is impressive.",
            date: "2025-04-15"
          },
          {
            id: 2,
            productId: 2, // Linking to Organic Cotton T-Shirt
            customer: "Sam Wilson",
            rating: 3.0,
            comment: "Comfortable but shrunk after washing.",
            date: "2025-04-10"
          },
          {
            id: 3,
            productId: 3, // Linking to Smart Home Speaker
            customer: "Taylor Smith",
            rating: 5.0,
            comment: "Perfect sound quality and easy setup!",
            date: "2025-04-05"
          },
          {
            id: 4,
            productId: 4, // Linking to Non-Stick Cookware Set
            customer: "Jordan Lee",
            rating: 4.0,
            comment: "Great quality pans, heats evenly.",
            date: "2025-03-28"
          },
          {
            id: 5,
            productId: 5, // Linking to Bestselling Novel
            customer: "Casey Brown",
            rating: 2.5,
            comment: "The story was okay but not worth the hype.",
            date: "2025-03-20"
          }
        ];

        setReviews(fetchedReviews);
        setLoading(false);
      } catch (err) {
        setError("Failed to load reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getProductById = (id) => {
    return dashboardData.popularProducts.find(product => product.id === id);
  };

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
              className="retry-button"
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
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews available for your products yet.</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => {
                const product = getProductById(review.productId);
                return (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <h3 className="review-product">
                        {product ? product.name : `Product #${review.productId}`}
                      </h3>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-customer">
                      <strong>Customer:</strong> {review.customer}
                    </div>
                    <div className="review-rating">
                      {renderRatingStars(review.rating)}
                      <span className="rating-value">{review.rating.toFixed(1)}/5</span>
                    </div>
                    <div className="review-comment">
                      <p>{review.comment}</p>
                    </div>
                    {product && (
                      <div className="review-product-info">
                        <span className="product-category">
                          {dashboardData.categories.find(c => c.value === product.category)?.label || product.category}
                        </span>
                        <span className="product-price">
                          ${product.price.toFixed(2)}
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