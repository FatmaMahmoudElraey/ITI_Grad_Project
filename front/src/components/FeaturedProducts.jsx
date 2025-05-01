import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../store/slices/productsSlice'; // Import the correct thunk
import TemplateCard from './TemplateCard'; 
// Import react-bootstrap components
import { Row, Col, Spinner, Alert } from 'react-bootstrap';

const FeaturedProducts = () => {
  const dispatch = useDispatch();
  // Use featuredItems from the state
  const { featuredItems, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts()); // Dispatch the correct action
  }, [dispatch]);

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h2 className="mb-3"> 
        Featured Products
      </h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>} 
      {error && <Alert variant="danger">{error}</Alert>} 
      {!loading && !error && featuredItems.length > 0 && (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4"> 
          {featuredItems.map((product) => (
            <Col key={product.id}> 
              <TemplateCard product={product} />
            </Col>
          ))}
        </Row>
      )}
      {!loading && !error && featuredItems.length === 0 && (
        <p>No featured products found.</p> 
      )}
    </div>
  );
};

export default FeaturedProducts;
