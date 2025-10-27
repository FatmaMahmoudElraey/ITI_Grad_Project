import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../store/slices/productsSlice'; // Import the correct thunk
import TemplateCard from './TemplateCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
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
      <h2 className="my-4 text-center fw-bold text-light p-2" style={{backgroundColor: '#660ff1', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '8px'}}> 
        Featured Products
      </h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>} 
      {error && <Alert variant="danger">{error}</Alert>} 
      {!loading && !error && featuredItems.length > 0 && (
        <div>
          <Swiper
            className = "pb-4"
            spaceBetween={10}
            slidesPerView={1.2}
            breakpoints={{
              480: { slidesPerView: 1 },
              600: { slidesPerView: 2 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 4 },
            }}
          >
            {featuredItems.map((product) => (
              <SwiperSlide key={product.id}>
                <div style={{height: '550px'}}>
                <TemplateCard
                  {...product}
                  reviews={product.reviews || []}
                  tags={product.tags || []}
                />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      {!loading && !error && featuredItems.length === 0 && (
        <p>No featured products found.</p> 
      )}
    </div>
  );
};

export default FeaturedProducts;
