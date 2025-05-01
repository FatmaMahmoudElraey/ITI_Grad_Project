import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productsSlice';
import TemplateCard from '../components/TemplateCard';
import { FiArrowLeft, FiGrid, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../styles/CategoryProducts.css'; // Assuming you have some custom styles
import '../styles/CategoryProducts.css'; // Assuming you have some custom styles
export default function CategoryProducts() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: products, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categoryProducts = products?.filter(
    product => product.category_name?.toLowerCase() === categoryName?.toLowerCase()
  );

  return (
    <>
      {/* Enhanced Category Header */}
      <div 
        className="category-hero position-relative overflow-hidden py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 15, 241, 0.8) 0%, rgba(135, 67, 255, 0.7) 100%)',
          minHeight: '320px',
        }}
      >
        {/* Decorative Elements */}
        <div 
          className="position-absolute"
          style={{
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            transform: 'translate(20%, -20%)',
          }}
        />

        <Container className="position-relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="link" 
              className="text-decoration-none mb-4 d-flex align-items-center"
              onClick={() => navigate('/shop')}
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              <FiArrowLeft className="me-2" />
              Back to Shop
            </Button>

            <Row className="align-items-center gy-4">
              <Col lg={7}>
                <div className="pe-lg-4">
                  <Badge 
                    bg="light" 
                    className="mb-3 px-3 py-2"
                    style={{ color: '#660ff1' }}
                  >
                    <FiPackage className="me-2" />
                    {categoryName} Category
                  </Badge>
                  <h1 className="display-4 fw-bold text-capitalize mb-3 text-white">
                    {categoryName} Templates
                  </h1>
                  <p className="lead mb-0 text-white-50">
                    Discover our collection of {categoryProducts?.length || 0} premium {categoryName} templates
                    designed to elevate your digital presence.
                  </p>
                </div>
              </Col>
              <Col lg={5}>
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="bg-white bg-opacity-10 rounded-3 p-4 h-100 backdrop-blur">
                      <div className="d-flex align-items-center">
                        <FiGrid className="me-3 text-white" size={24} />
                        <div>
                          <div className="text-white-50 small">Available Templates</div>
                          <div className="text-white fs-4 fw-bold">
                            {categoryProducts?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="bg-white bg-opacity-10 rounded-3 p-4 h-100 backdrop-blur">
                      <div className="d-flex align-items-center">
                        <FiPackage className="me-3 text-white" size={24} />
                        <div>
                          <div className="text-white-50 small">Starting From</div>
                          <div className="text-white fs-4 fw-bold">
                            ${Math.min(...(categoryProducts?.map(p => p.price) || [0])) || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : categoryProducts?.length === 0 ? (
          <div className="text-center py-5">
            <h3>No templates found in this category</h3>
            <p className="text-muted">Try checking out other categories</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/shop')}
              style={{ backgroundColor: '#660ff1', borderColor: '#660ff1' }}
            >
              Browse All Templates
            </Button>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {categoryProducts?.map(template => (
              <Col key={template.id}>
                <TemplateCard {...template} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}