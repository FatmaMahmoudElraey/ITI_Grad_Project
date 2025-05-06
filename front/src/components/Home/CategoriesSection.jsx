import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/productsSlice';
import '../../styles/home/CategoriesSection.css';

const CategoriesSection = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.products);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  // Fetch categories when component mounts
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Existing scroll effect
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
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 300; // Width of one card
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
      <section id="category-section" className="py-5">
        <Container className="position-relative px-4">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section id="category-section" className="py-5">
        <Container className="position-relative px-4">
          <div className="text-center text-danger">
            <p>Error loading categories: {error}</p>
          </div>
        </Container>
      </section>
    );
  }

  const categoryDisplay = categories.map(category => ({
    name: category.name,
    image: category.image || 'https://via.placeholder.com/300', // Fallback image
    bgColor: '#f1f7ff',
    textColor: '#1565c0',
  }));

  return (
    <section id="category-section" className="py-5">
      <Container className="position-relative px-4">
        <div 
          className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5"
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: `translateY(${isVisible ? 0 : '20px'})`,
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <div className="text-center text-md-start mb-4 mb-md-0">
            <h6 
              className="text-uppercase mb-1 fw-bold" 
              style={{ 
                letterSpacing: '1.5px',
                color: '#6600f1'  // Changed from text-success
              }}
            >
              Explore
            </h6>
            <h2 className="display-6 fw-bold mb-0 text-body-secondary">
              Shop by Category
            </h2>
          </div>

          <Link to="/all-categories">
            <Button 
              variant="outline-primary" 
              size="lg" 
              className="rounded-pill px-5 py-3 fw-bold browse-all-btn"
              style={{
                borderColor: '#6600f1',
                color: '#6600f1',
                letterSpacing: '0.5px'
              }}
            >
              Browse All Categories
              <FaArrowRight className="ms-2" />
            </Button>
          </Link>
        </div>
        
        <div className="position-relative">
          <button 
            className="scroll-button scroll-left"
            onClick={() => scroll('left')}
            style={{ opacity: scrollPosition > 0 ? 1 : 0 }}
          >
            <FaChevronLeft />
          </button>

          <div 
            className="categories-scroll-container"
            ref={containerRef}
            onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
          >
            <div className="categories-row">
              {categoryDisplay.map((category, index) => (
                <div 
                  key={category.name}
                  className="category-item"
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
                      className="h-100 border-0 rounded-4 overflow-hidden w-100"
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
                        
                        <p className="text-muted small mb-0">{category.count}</p>
                      </Card.Body>
                    </Card>
                  </Link>
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
      </Container>
    </section>
  );
};

export default CategoriesSection;
