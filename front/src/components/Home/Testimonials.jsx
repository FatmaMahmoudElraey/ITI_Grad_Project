import React from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaDownload, FaStar, FaUsers } from 'react-icons/fa';

export default function Testimonials() {
  return (
    <>
    
          <div className="bg-light py-5">
            <Container>
              <Row className="mb-4">
                <Col>
                  <h2 className="text-center mb-4">What Our Customers Say</h2>
                  <p className="text-center text-muted mb-5">
                    Don't just take our word for it - hear from our satisfied customers.
                  </p>
                </Col>
              </Row>
    
              <Row>
                <Col md={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="mb-3">
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                      </div>
                      <Card.Text className="mb-4">
                        "The e-commerce template I purchased was exactly what I needed. Easy to set up and my online store was live within days!"
                      </Card.Text>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          JD
                        </div>
                        <div>
                          <h6 className="mb-0">John Doe</h6>
                          <small className="text-muted">E-commerce Owner</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
    
                <Col md={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="mb-3">
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                      </div>
                      <Card.Text className="mb-4">
                        "I've used many template services over the years, but WebsiteMarket offers the best quality and support by far. Highly recommend!"
                      </Card.Text>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          AS
                        </div>
                        <div>
                          <h6 className="mb-0">Amanda Smith</h6>
                          <small className="text-muted">Freelance Designer</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
    
                <Col md={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="mb-3">
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-fill text-warning" />
                        <i className="bi bi-star-half text-warning" />
                      </div>
                      <Card.Text className="mb-4">
                        "The business template saved us thousands in development costs. Professional design and easy to update. Our clients love it!"
                      </Card.Text>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          RJ
                        </div>
                        <div>
                          <h6 className="mb-0">Robert Johnson</h6>
                          <small className="text-muted">Marketing Agency</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
    
    </>
  )
}
