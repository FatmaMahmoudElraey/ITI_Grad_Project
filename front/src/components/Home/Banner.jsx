import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import '../../styles/home/Banner.css';

const Banner = () => {
  return (
    <section className="banner-section py-5">
      <Container>
        <Row className="min-vh-75 align-items-center">
          <Col lg={8} className="mx-auto text-center text-white">
            <span className="text-uppercase fw-bold tracking-wider mb-4 d-block banner-offer-text">
              Special Offer
            </span>
            <h2 className="display-4 fw-bold mb-4 banner-title">
              Get 50% Off On Premium Templates
            </h2>
            <p className="lead mb-5 mx-auto banner-description">
              Discover our premium collection of professionally designed templates. 
              Perfect for your next project.
            </p>
            <Link to="/shop">
              <Button 
                variant="primary"
                size="lg"
                className="rounded-pill px-5 py-3 fw-bold banner-button"
              >
                Explore Now
                <FaArrowRight className="ms-2" />
              </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;