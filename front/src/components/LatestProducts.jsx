import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestProducts } from '../store/slices/productsSlice';
import TemplateCard from './TemplateCard'; 
import { Row, Col, Spinner, Alert } from 'react-bootstrap';

const LatestProducts = () => {
  const dispatch = useDispatch();
  const { latestItems, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchLatestProducts());
  }, [dispatch]);

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h2 className="mb-3"> 
        Latest Products
      </h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>} 
      {error && <Alert variant="danger">{error}</Alert>} 
      {!loading && !error && latestItems.length > 0 && (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4"> 
          {latestItems.map((product) => (
            <Col key={product.id}> 
              <TemplateCard 
                {...product}
                reviews={product.reviews || []}
                tags={product.tags || []}
              />
            </Col>
          ))}
        </Row>
      )}
      {!loading && !error && latestItems.length === 0 && (
        <p>No latest products found.</p> 
      )}
    </div>
  );
};

export default LatestProducts;
