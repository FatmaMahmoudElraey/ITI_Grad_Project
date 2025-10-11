import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ categories, stats }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  return (
    <div className="shop-hero position-relative overflow-hidden py-5">
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="display-4 fw-bold mb-4" style={{ color: '#17254E' }}>
                Discover Premium Templates
              </h1>
              <p className="lead mb-4" style={{ color: '#17254E' }}>
                Browse through our collection of high-quality, responsive templates
                designed to elevate your online presence.
              </p>

              {/* Popular Categories */}
              <div className="mt-4">
                <div className="d-flex gap-2 flex-wrap">
                  {categories?.slice(0, 4).map((category) => (
                    <Button
                      key={category.id}
                      variant="outline-primary"
                      size="sm"
                      className="rounded-pill"
                      onClick={() => handleCategoryClick(category.name)}
                      style={{ borderColor: '#660ff1', color: '#660ff1' }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          </Col>

          {/* Stats Cards */}
                <Col lg={6}>
                <Row className="g-3">
                  {[
                  { title: 'Templates', value: `${stats.templates}+`, color: '#FF6B6B' },
                  { title: 'Categories', value: `${stats.categories}+`, color: '#4ECDC4' },
                  { title: 'Customers', value: `${Math.floor(stats.customers/1000)}k+`, color: '#45B7D1' },
                  { title: 'Downloads', value: `${Math.floor(stats.downloads/1000)}k+`, color: '#96C93D' }
                  ].map((stat, index) => (
                  <Col xs={6} sm={6} key={index}>
                    <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    >
                    <Card className="border-0 shadow-sm p-0">
                      <Card.Body className="d-flex align-items-center ">
                      <div 
                        className="rounded-circle p-3 me-2"
                        style={{ backgroundColor: `${stat.color}20` }}
                      >
                        <div 
                        className="rounded-circle p-2"
                        style={{ backgroundColor: stat.color }}
                        />
                      </div>
                      <div>
                        <h3 className="fw-bold mb-0">{stat.value}</h3>
                        <p className="text-muted mb-0">{stat.title}</p>
                      </div>
                      </Card.Body>
                    </Card>
                    </motion.div>
                  </Col>
                  ))}
                </Row>
                </Col>
              </Row>
              </Container>
      <div className="position-absolute top-0 end-0 mt-5">
        <svg width="350" height="350" viewBox="0 0 200 200">
          <path
            fill="#660ff120"
            d="M45.3,-59.1C58.9,-51.1,70.3,-37.4,73.8,-22.1C77.4,-6.8,73.1,10.2,65.1,24.5C57.1,38.9,45.3,50.5,31.8,57.7C18.3,64.9,3,67.6,-11.8,64.9C-26.7,62.2,-41.1,54,-52.1,42.1C-63.1,30.2,-70.7,14.6,-70.7,-1C-70.7,-16.7,-63,-32.3,-51.6,-40.4C-40.2,-48.5,-25,-49.1,-10.5,-51.9C4,-54.7,17.8,-59.8,31.7,-67.1C45.7,-74.4,59.8,-84,45.3,-59.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;