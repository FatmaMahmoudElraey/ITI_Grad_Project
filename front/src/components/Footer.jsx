import { Container, Row, Col, ListGroup, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import Logo from '../assets/images/navbar/logo.png';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-dark text-white pt-5 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <Navbar.Brand as={Link} to="/" className="text-light fw-bold d-flex align-items-center mb-4">
              <img
                alt="Logo"
                src={Logo}
                width="30"
                height="24"
                className="d-inline-block align-top me-2"
              />
              <span className="brand-text">WEBIFY</span>
            </Navbar.Brand>
            <p className="mb-4">
              Discover our premium collection of website templates from e-commerce to portfolios.<br/>
               find the perfect template 
              to showcase your brand.
            </p>
            <div className="d-flex gap-3 mb-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <FiFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <FiTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <FiInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white fs-5">
                <FiLinkedin />
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Quick Links</h5>
            <ListGroup variant="flush" className="footer-links">
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/" className="text-white text-decoration-none">Home</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/shop" className="text-white text-decoration-none">Shop</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/about" className="text-white text-decoration-none">About Us</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/contact" className="text-white text-decoration-none">Contact Us</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="text-uppercase mb-4">Support</h5>
            <ListGroup variant="flush" className="footer-links">
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/FAQ" className="text-white text-decoration-none">FAQ</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="/blogs" className="text-white text-decoration-none">Blogs</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="#" className="text-white text-decoration-none">Terms of Service</Link>
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 p-0 mb-2">
                <Link to="#" className="text-white text-decoration-none">Help Center</Link>
              </ListGroup.Item>
            </ListGroup>
          </Col>

          <Col md={4}>
            <h5 className="text-uppercase mb-4">Stay Updated</h5>
            <p className="mb-3">
              Subscribe to receive updates about new templates and exclusive offers.
            </p>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                aria-label="Enter your email"
              />
              <button 
                className="btn" 
                type="button"
                style={{ backgroundColor: '#660ff1', color: 'white' }}
              >
                Subscribe
              </button>
            </div>
            <p className="small" style={{color:"#d7bfffff"}}>
              We respect your privacy. Unsubscribe at any time.
            </p>
          </Col>
        </Row>

        <hr className="my-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <Row className="align-items-center">
          <Col md={12} className=" ">
            <p className="small text-center text-white mb-0">
              &copy; {new Date().getFullYear()} Webify. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
            <Link to="/privacy-policy" className="text-muted me-3 small text-decoration-none">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted me-3 small text-decoration-none">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-muted small text-decoration-none">
              Contact Us
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
