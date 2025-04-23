import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'react-bootstrap-icons';
import { FaArrowRight } from 'react-icons/fa';

const CategoriesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('category-section');
      if (element) {
        const position = element.getBoundingClientRect();
        if (position.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { 
      name: 'Books', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#f1f7ff',
      textColor: '#1565c0',
      count: '2,543 items'
    },
    { 
      name: 'Electronics', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#f2f9f4',
      textColor: '#2e7d32',
      count: '1,789 items'
    },
    { 
      name: 'Fashion', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#fff8f0',
      textColor: '#ef6c00',
      count: '3,156 items'
    },
    { 
      name: 'Food', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#fff5f5',
      textColor: '#c62828',
      count: '952 items'
    },
    { 
      name: 'Art', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#f9f4fb',
      textColor: '#7b1fa2',
      count: '1,345 items'
    },
    { 
      name: 'Ecommerce', 
      image: 'https://thumbs.dreamstime.com/b/e-commerce-revolution-online-marketplace-digital-shopping-mobile-transactions-laptop-purchasing-virtual-cart-e-commerce-revolution-371743244.jpg', 
      bgColor: '#f0fafc',
      textColor: '#00838f',
      count: '867 items'
    },
    { 
      name: 'Jobs', 
      image: 'https://st4.depositphotos.com/1026266/40735/i/450/depositphotos_407352428-stock-photo-hand-pointing-at-inscription.jpg', 
      bgColor: '#fffbf0',
      textColor: '#ff8f00',
      count: '1,253 items'
    },
    { 
      name: 'Home & Garden', 
      image: 'https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg?t=st=1745243583~exp=1745247183~hmac=cce5376425e88dfc7647d706840f7af539915f625e68962c547aba38968f16ab&w=1380', 
      bgColor: '#f4f5fa',
      textColor: '#283593',
      count: '2,076 items'
    },
  ];

  return (
    <section id="category-section" className="py-5">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-5" 
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: `translateY(${isVisible ? 0 : '20px'})`,
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <div>
            <h6 className="text-success text-uppercase mb-1 fw-bold" style={{ letterSpacing: '1.5px' }}>
              Explore
            </h6>
            <h2 className="display-6 fw-bold mb-0 text-body-secondary">Shop by Category</h2>
          </div>
          
          {/* <Link to="/categories" className="text-decoration-none d-none d-md-flex align-items-center">
            <span className="me-2 fw-medium">View All Categories</span>
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" 
              style={{ width: '32px', height: '32px', color: 'white' }}>
              <ArrowRight size={18} />
            </div>
          </Link> */}
          
          <Link to="/categories">
            <Button 
                        variant="outline-success" 
                        size="lg" 
                        className="rounded-pill px-5 py-3 fw-bold"
                        style={{ letterSpacing: '0.5px' }}
                      >
                        Browse All Categories
                        <FaArrowRight className="ms-2" />
                      </Button>
          </Link>
        </div>
        
        <Row className="g-4">
          {categories.map((category, index) => (
            <Col key={index} xs={6} sm={4} md={3} className="mb-3"
              style={{ 
                opacity: isVisible ? 1 : 0, 
                transform: `translateY(${isVisible ? 0 : '30px'})`,
                transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`,
              }}
            >
              <Link 
                to={`/category/${category.name.toLowerCase()}`} 
                className="text-decoration-none"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card 
                  className="h-100 border-0 rounded-4 overflow-hidden"
                  style={{ 
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: hoveredIndex === index ? 'translateY(-12px)' : 'translateY(0)',
                    boxShadow: hoveredIndex === index 
                      ? '0 16px 30px rgba(0,0,0,0.15)'
                      : '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                >
                  <div 
                    className="position-relative overflow-hidden"
                    style={{ 
                      backgroundColor: category.bgColor,
                      height: '180px',
                    }}
                  >
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-100 h-100 object-fit-contain p-3"
                      style={{
                        transition: 'all 0.5s ease',
                        transform: hoveredIndex === index ? 'scale(1.08)' : 'scale(1)'
                      }}
                    />
                    {hoveredIndex === index && (
                      <div 
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%)',
                          animation: 'fadeIn 0.3s forwards',
                        }}
                      />
                    )}
                  </div>
                  
                  <Card.Body className="text-center p-3" style={{ backgroundColor: '#ffffff' }}>
                    <Card.Title 
                      className="fw-bold mb-1" 
                      style={{ 
                        color: hoveredIndex === index ? category.textColor : '#202020',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {category.name}
                    </Card.Title>
                    <p className="text-muted small mb-2">{category.count}</p>
                    
                    {/* <div 
                      className="mt-2 d-inline-flex align-items-center justify-content-center"
                      style={{ 
                        transition: 'all 0.3s ease',
                        opacity: hoveredIndex === index ? 1 : 0,
                        height: hoveredIndex === index ? '24px' : '0',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ 
                        color: category.textColor, 
                        fontWeight: 500,
                        fontSize: '14px'
                      }}>
                        Shop Now
                      </span>
                      <ChevronRight size={14} style={{ color: category.textColor, marginLeft: '3px' }} />
                    </div> */}
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
        
        <div 
          className="text-center mt-5"
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: `translateY(${isVisible ? 0 : '20px'})`,
            transition: 'opacity 0.6s ease-out 0.8s, transform 0.6s ease-out 0.8s',
          }}
        >
          {/* <Link to="/categories">
            <Button 
              variant="primary" 
              size="lg"
              className="rounded-pill px-4 py-2 fw-medium d-inline-flex align-items-center"
              style={{ boxShadow: '0 4px 12px rgba(13, 110, 253, 0.25)' }}
            >
              Browse All Categories <ArrowRight size={18} className="ms-2" />
            </Button>
          </Link> */}
        </div>
      </Container>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default CategoriesSection;