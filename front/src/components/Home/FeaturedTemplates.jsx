import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaEye, FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProducts } from '../../store/slices/productsSlice';
import { Link } from 'react-router-dom';
import '../../styles/Home/FeaturedTemplates.css';

export default function FeaturedTemplates() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  const { featuredItems, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 400;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
    return (
      <section className="featured-templates py-5">
        <Container>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-templates py-5">
        <Container>
          <div className="text-center text-danger">
            <p>Error loading featured templates: {error}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="featured-templates py-5 border border-1 border-danger-subtle rounded-2 m-5">
      <Container>
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <span 
              className="text-uppercase fw-bold tracking-wider mb-2 d-block"
              style={{ color: '#6600f1' }}
            >
              Featured Templates
            </span>
            <h2 className="display-6 fw-bold">
              Most Popular Templates
            </h2>
            <div className="title-underline mx-auto mb-4"></div>
          </Col>
        </Row>

        <div className="position-relative">
          <button 
            className="scroll-button scroll-left"
            onClick={() => scroll('left')}
            style={{ opacity: scrollPosition > 0 ? 1 : 0 }}
          >
            <FaChevronLeft />
          </button>

          <div 
            className="templates-scroll-container"
            ref={containerRef}
            onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
          >
            <div className="templates-row">
              {featuredItems.map((template, index) => (
                <div 
                  key={template.id}
                  className="template-item"
                >
                  <div 
                    className="template-image-card position-relative"
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <img 
                      src={template.photo || template.preview_image || 'https://via.placeholder.com/300'} 
                      alt={template.title}
                      className="template-image rounded-3"
                      style={{
                        height: '300px',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    
                    <div 
                      className="overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-3"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8))',
                        opacity: hoveredCard === index ? 1 : 0,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <Link to={`/product-details/${template.id}`}>
                        <Button 
                          variant="light" 
                          className="rounded-circle mb-3 p-3"
                        >
                          <FaEye size={20} style={{ color: '#660ff1' }} />
                        </Button>
                      </Link>
                      
                      <h5 className="text-white fw-bold mb-2">{template.title}</h5>
                      <Badge 
                        bg="success" 
                        className="rounded-pill px-3 py-2"
                        style={{ backgroundColor: '#660ff1' }}
                      >
                        {template.category_name || 'Uncategorized'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="scroll-button scroll-right"
            onClick={() => scroll('right')}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="text-center mt-5">
          <Link to="/shop">
            <Button 
              variant="outline-primary" 
              size="lg" 
              className="rounded-pill px-5 py-3 fw-bold view-all-btn"
              style={{
                borderColor: '#6600f1',
                color: '#6600f1'
              }}
            >
              View All Templates
              <FaArrowRight className="ms-2" />
            </Button>
          </Link>
        </div>
      </Container>

    </section>
  );
}