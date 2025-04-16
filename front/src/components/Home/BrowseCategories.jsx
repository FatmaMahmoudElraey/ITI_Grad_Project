import React from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import '../../styles/home/browseCategories.css';

export default function BrowseCategories() {
  return (
    <>

          {/* Categories Section */}
          <div className="bg-light py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="text-center mb-4">Browse by Category</h2>
              <p className="text-center text-muted mb-5">
                Find the perfect template for your specific industry needs.
              </p>
            </Col>
          </Row>

          <Row>
            <Col md={3} className="mb-4">
              <Link to="/templates?category=e-commerce" className="text-decoration-none">
                <Card className="h-100 text-center shadow-sm category-card">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <div className="icon-circle bg-primary bg-opacity-10 p-3 mb-3">
                      <i className="bi bi-cart fs-1 text-primary" />
                    </div>
                    <Card.Title>E-commerce</Card.Title>
                    <Card.Text className="text-muted small">
                      Online stores and shopping websites
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>

            <Col md={3} className="mb-4">
              <Link to="/templates?category=portfolio" className="text-decoration-none">
                <Card className="h-100 text-center shadow-sm category-card">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <div className="icon-circle bg-success bg-opacity-10 p-3 mb-3">
                      <i className="bi bi-briefcase fs-1 text-success" />
                    </div>
                    <Card.Title>Portfolio</Card.Title>
                    <Card.Text className="text-muted small">
                      Showcase your work and personal brand
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>

            <Col md={3} className="mb-4">
              <Link to="/templates?category=business" className="text-decoration-none">
                <Card className="h-100 text-center shadow-sm category-card">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <div className="icon-circle bg-info bg-opacity-10 p-3 mb-3">
                      <i className="bi bi-building fs-1 text-info" />
                    </div>
                    <Card.Title>Business</Card.Title>
                    <Card.Text className="text-muted small">
                      Corporate, agency, and service websites
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>

            <Col md={3} className="mb-4">
              <Link to="/templates?category=blog" className="text-decoration-none">
                <Card className="h-100 text-center shadow-sm category-card">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <div className="icon-circle bg-warning bg-opacity-10 p-3 mb-3">
                      <i className="bi bi-newspaper fs-1 text-warning" />
                    </div>
                    <Card.Title>Blog</Card.Title>
                    <Card.Text className="text-muted small">
                      Content-focused websites and blogs
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    
    </>
  )
}
