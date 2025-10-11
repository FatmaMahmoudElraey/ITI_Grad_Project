import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestProducts } from '../store/slices/productsSlice';
import TemplateCard from './TemplateCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';

const LatestProducts = () => {
  const dispatch = useDispatch();
  const { latestItems, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchLatestProducts());
  }, [dispatch]);

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h2 className="my-4 text-center text-light p-2" style={{backgroundColor: '#660ff1'}}> 
        Latest Products
      </h2>
      {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>} 
      {error && <Alert variant="danger">{error}</Alert>} 
      {!loading && !error && latestItems.length > 0 && (
        <div>
          <Swiper
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              480: { slidesPerView: 1.2 },
              600: { slidesPerView: 2 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 4 },
            }}
          >
            {latestItems.map((product) => (
              <SwiperSlide key={product.id}>
                <div style={{height: '100%'}}>
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
      {!loading && !error && latestItems.length === 0 && (
        <p>No latest products found.</p> 
      )}
    </div>
  );
};

export default LatestProducts;
