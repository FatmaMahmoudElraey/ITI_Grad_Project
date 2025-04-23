import React from 'react';
import { Container, Row, Col, Carousel, Card, Badge } from 'react-bootstrap';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';
import '../../styles/home/testimonials.css';

export default function Testimonials() {
  const testimonials = [
    {
      name: "John Doe",
      role: "E-commerce Owner",
      text: "The e-commerce template I purchased was exactly what I needed. Easy to set up and my online store was live within days!",
      image: "https://i.pravatar.cc/150?img=1",
      stars: 5
    },
    {
      name: "Amanda Smith",
      role: "Freelance Designer",
      text: "I've used many template services over the years, but WebsiteMarket offers the best quality and support by far. Highly recommend!",
      image: "https://i.pravatar.cc/150?img=2",
      stars: 5
    },
    {
      name: "Robert Johnson",
      role: "Marketing Agency",
      text: "The business template saved us thousands in development costs. Professional design and easy to update. Our clients love it!",
      image: "https://i.pravatar.cc/150?img=3",
      stars: 4.5
    }
  ];

  return (
    <div className="bg-light py-4">
      <Container>
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className=" heat-title fw-bold mb-3">What Our Clients Say</h2>
            <div className="mx-auto border-bottom" style={{ width: '50px', borderColor: '#660ff1' }}></div>
          </Col>
        </Row>

        <Carousel 
          indicators={true}
          controls={false}
          interval={3000}
          pause={false}
          className="testimonial-carousel"
        >
          {testimonials.map((testimonial, index) => (
            <Carousel.Item key={index}>
              <Card className="mx-auto border-0 shadow-sm hover-card" 
                    style={{ maxWidth: '600px' }}>
                <Card.Body className="p-4 text-center">
                  <FaQuoteLeft className="mb-3" style={{ color: '#660ff1', opacity: 0.2 }} size={20} />
                  
                  <div>
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="rounded-circle mb-3"
                      style={{
                        width: '60px',
                        height: '60px',
                        border: '2px solid #660ff1',
                        padding: '2px'
                      }}
                    />
                    
                    <Card.Text className="fst-italic text-muted mb-3">
                      {testimonial.text}
                    </Card.Text>
                    
                    <div className="mb-2">
                      {[...Array(Math.floor(testimonial.stars))].map((_, i) => (
                        <FaStar key={i} className="text-warning mx-1" />
                      ))}
                    </div>
                    
                    <h6 className="fw-bold mb-1">{testimonial.name}</h6>
                    <small style={{ color: '#660ff1' }}>{testimonial.role}</small>
                  </div>
                </Card.Body>
              </Card>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </div>
  );
}
