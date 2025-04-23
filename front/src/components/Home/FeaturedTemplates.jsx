import React, { useState } from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaEye, FaArrowRight } from 'react-icons/fa';

export default function FeaturedTemplates() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const templates = [
    {
      id: 1,
      title: "Modern E-commerce",
      image: "https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg",
      category: "E-commerce",
      price: 49,
      rating: 4.8,
      downloads: 1.2,
      tags: ["Responsive", "Bootstrap 5", "React"],
      features: ["Shopping Cart", "Product Gallery", "User Dashboard"],
      accent: "#660ff1" // Primary brand color
    },
    {
      id: 2,
      title: "Creative Portfolio",
      image: "https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg",
      category: "Portfolio",
      price: 39,
      rating: 4.9,
      downloads: 0.8,
      tags: ["Minimalist", "Animation", "Grid Layout"],
      features: ["Project Showcase", "Blog Section", "Contact Form"],
      accent: "#660ff1"
    },
    {
      id: 3,
      title: "Business Pro",
      image: "https://img.freepik.com/free-photo/website-design-content-layout-graphic_53876-21203.jpg",
      category: "Business",
      price: 59,
      rating: 4.7,
      downloads: 2.1,
      tags: ["Corporate", "Service Pages", "Team"],
      features: ["Appointment Booking", "Newsletter", "Testimonials"],
      accent: "#660ff1"
    }
  ];

  return (
    <section className="featured-templates py-5 border border-1 border-danger-subtle rounded-2 m-5">
      <Container>
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <span className="text-primary text-uppercase fw-bold tracking-wider mb-2 d-block">
              Featured Templates
            </span>
            <h2 className="display-6 fw-bold ">
              Most Popular Templates
            </h2>
            <div className="title-underline mx-auto mb-4"></div>
            {/* <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Discover our hand-picked selection of premium website templates that stand out from the crowd
            </p> */}
          </Col>
        </Row>

        <Row className="g-4">
          {templates.map((template, index) => (
            <Col key={template.id} lg={4} md={6}>
              <div 
                className="template-image-card position-relative"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img 
                  src={template.image} 
                  alt={template.title}
                  className="w-100 template-image rounded-3"
                  style={{
                    height: '300px',
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
                  <Button 
                    variant="light" 
                    className="rounded-circle mb-3 p-3"
                  >
                    <FaEye size={20} style={{ color: '#660ff1' }} />
                  </Button>
                  
                  <h5 className="text-white fw-bold mb-2">{template.title}</h5>
                  <Badge 
                    bg="success" 
                    className="rounded-pill px-3 py-2"
                    style={{ backgroundColor: '#660ff1' }}
                  >
                    {template.category}
                  </Badge>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-5">
          <Button 
            variant="outline-primary" 
            size="lg" 
            className="rounded-pill px-5 py-3 fw-bold"
          >
            View All Templates
            <FaArrowRight className="ms-2" />
          </Button>
        </div>
      </Container>
    </section>
  );
}