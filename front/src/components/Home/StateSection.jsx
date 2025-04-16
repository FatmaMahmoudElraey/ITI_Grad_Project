import React from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaDownload, FaStar, FaUsers } from 'react-icons/fa';

export default function StateSection() {
  return (
    <>
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4">
              <div className="display-4 mb-3" style={{ color: '#660ff1' }}>
                <FaDownload />
              </div>
              <h3>10K+</h3>
              <p className="text-muted">Downloads</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4">
              <div className="display-4 mb-3" style={{ color: '#660ff1' }}>
                <FaUsers />
              </div>
              <h3>50K+</h3>
              <p className="text-muted">Happy Customers</p>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm p-4">
              <div className="display-4 mb-3" style={{ color: '#660ff1' }}>
                <FaStar />
              </div>
              <h3>4.8/5</h3>
              <p className="text-muted">Average Rating</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
