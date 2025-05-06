import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaDownload, FaUsers, FaStar, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

//import hom.css from 
import '../../styles/home/hero.css';

export default function Hero() {
  return (
    <div style={{ background: 'linear-gradient(to right, #f5e3e1, #eef0ee, #dcefeb)' }} className="py-5">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={5}>
            <h1 className="display-4 fw-bold mb-4" style={{ color: '#17254E' }}>
              Premium Website Templates for Your Digital Success
            </h1>
            <p className="lead mb-4" style={{ color: '#17254E' }}>
              Discover our collection of professional, responsive, and customizable website templates.
              Perfect for businesses, portfolios, and e-commerce stores.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/shop" className="text-decoration-none">
                <Button 
                  style={{ backgroundColor: '#660ff1', border: 'none' }} 
                  size="lg" 
                  className="fw-bold text-white"
                >
                  Browse Templates
                </Button>
              </Link>
              <Link to="/about" className="text-decoration-none">
                <Button 
                  style={{ 
                    backgroundColor: 'transparent', 
                    border: '2px solid #660ff1',
                    color: '#660ff1'
                  }}
                  size="lg" 
                  className="d-flex align-items-center gap-2"
                >
                  Learn More <FaArrowRight />
                </Button>
              </Link>
            </div>
            <Row className="mt-5">
              {['500+ Templates', '24/7 Support', '100% Satisfaction'].map((item, index) => (
                <Col xs={4} key={index}>
                  <div className="border-start border-3 ps-3" style={{ borderColor: '#2FC7A1' }}>
                    <h3 className="fw-bold mb-0" style={{ color: '#17254E' }}>
                      {item.split(' ')[0]}
                    </h3>
                    <p className="mb-0" style={{ color: '#17254E', fontSize: '0.9rem' }}>
                      {item.split(' ')[1]}
                    </p>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col lg={7}>
            <div className="position-relative ms-lg-5">
              <div className="position-absolute" style={{ top: '-20px', left: '20px', zIndex: 2 }}>
                <div style={{ backgroundColor: '#660ff1' }} className="text-white p-3 rounded-3 shadow-lg">
                  <FaStar className="me-2" />
                  <span className="fw-bold">Trusted by 50K+ users</span>
                </div>
              </div>

              {/* Main Image */}
              <div className="position-relative">
                <img 
                  src="https://verpex.com/assets/uploads/images/blog/10-Most-Popular-Types-of-Websites.webp?v=1706620525" 
                  alt="Featured Template" 
                  className="rounded-4 shadow-lg img-fluid"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                
                <div className="position-absolute" style={{ bottom: '30px', right: '-20px' }}>
                  <Card className="border-0 shadow-lg p-3" style={{ maxWidth: '200px', backgroundColor: '#dcefeb' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ backgroundColor: '#FE543D' }} className="rounded-circle p-2">
                        <FaDownload className="text-white" />
                      </div>
                      <div>
                        <small style={{ color: '#17254E' }}>Latest Release</small>
                        <p className="fw-bold mb-0" style={{ color: '#17254E' }}>E-commerce Pack</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
