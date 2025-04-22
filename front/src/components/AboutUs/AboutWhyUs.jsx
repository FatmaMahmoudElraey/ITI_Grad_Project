
import { Container, Row, Col, Card } from "react-bootstrap";

import '../../styles/about/about.css';

export default function AboutWhyUs() {
  return (
    <>
        <Container className="my-5 text-center">
          <h2 className="fw-bold " style={{ color: '#660ff1' }}>Why Choose Us?</h2>
          <p className="text-muted">Here’s why we stand out.</p>
          <Row className="g-4">
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <h5 className="fw-bold">Fully Responsive</h5>
                <p className="text-muted">Works perfectly on all devices.</p>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <h5 className="fw-bold">Modern Design</h5>
                <p className="text-muted">Latest web design trends.</p>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <h5 className="fw-bold">5000+ Happy Customers</h5>
                <p className="text-muted">Trusted by developers worldwide.</p>
              </Card>
            </Col>
          </Row>
        </Container>
    
    </>
  )
}
