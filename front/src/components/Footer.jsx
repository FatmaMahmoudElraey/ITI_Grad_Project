import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">WebsiteMarket</h5>
            <p className="mb-4">
              Your one-stop marketplace for high-quality website templates and themes.
              Find the perfect design for your business needs.
            </p>
            <div className="d-flex gap-3 mb-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <i className="bi bi-facebook" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <i className="bi bi-twitter" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <i className="bi bi-instagram" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <i className="bi bi-linkedin" />
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Links</h5>
            <ListGroup variant="flush" className="footer-links">
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/" className="text-white text-decoration-none">Home</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/templates" className="text-white text-decoration-none">Templates</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/pricing" className="text-white text-decoration-none">Pricing</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/about" className="text-white text-decoration-none">About</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Categories</h5>
            <ListGroup variant="flush" className="footer-links">
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/templates?category=e-commerce" className="text-white text-decoration-none">E-commerce</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/templates?category=portfolio" className="text-white text-decoration-none">Portfolio</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/templates?category=business" className="text-white text-decoration-none">Business</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/templates?category=blog" className="text-white text-decoration-none">Blog</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={4}>
            <h5 className="text-uppercase mb-4">Newsletter</h5>
            <p className="mb-3">
              Subscribe to get updates on new templates and special offers.
            </p>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                aria-label="Your email"
              />
              <button className="btn btn-primary" type="button">
                Subscribe
              </button>
            </div>
            <p className="small text-muted">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </Col>
        </Row>

        <hr className="my-4" />

        <Row>
          <Col className="text-center text-md-start">
            <p className="small text-muted mb-0">
              &copy; {new Date().getFullYear()} WebsiteMarket. All rights reserved.
            </p>
          </Col>
          <Col className="text-center text-md-end">
            <Link  className="text-muted me-3 small">
              Privacy Policy
            </Link>
            <Link  className="text-muted me-3 small">
              Terms of Service
            </Link>
            <Link  className="text-muted small">
              Contact Us
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
