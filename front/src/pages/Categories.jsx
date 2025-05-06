import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCategories } from '../store/slices/productsSlice';
import { FiArrowRight } from 'react-icons/fi';
import '../styles/Categories.css'; 

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      {/* Hero Section */}
      <section className="categories-hero">
        <div className="hero-pattern"></div>
        <Container>
          <motion.div
            className="hero-content text-center"    
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="hero-title">
              Explore Our Categories
            </h1>
            <p className="hero-description">
              Discover a world of premium templates crafted to perfection. 
              Find the perfect match for your next project.
            </p>
          </motion.div>
        </Container>
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,96L34.3,106.7C68.6,117,137,139,206,144C274.3,149,343,139,411,122.7C480,107,549,85,617,90.7C685.7,96,754,128,823,133.3C891.4,139,960,117,1029,106.7C1097.1,96,1166,96,1234,101.3C1302.9,107,1371,117,1406,122.7L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Categories Grid */}
      <Container className="py-5">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {categories.map((category, index) => (
              <Col key={category.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link 
                    to={`/category/${category.name.toLowerCase()}`}
                    className="text-decoration-none"
                  >
                    <Card className="category-card h-100 border-0">
                      <div className="category-image-wrapper">
                        <Card.Img 
                          variant="top" 
                          src={category.image || 'https://via.placeholder.com/300'}
                          alt={category.name}
                          className="category-image"
                        />
                        <div className="category-overlay">
                          <span className="category-view">View Category</span>
                        </div>
                      </div>
                      <Card.Body className="category-body p-4">
                        <Card.Title className="h4 mb-3">{category.name}</Card.Title>
                        
                      </Card.Body>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Categories;