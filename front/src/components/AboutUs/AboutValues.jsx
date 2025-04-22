
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import {
  FaStar, 
  FaUsers, 
  FaShoppingCart, 
  FaShieldAlt,
} from "react-icons/fa";

import "../../styles/about/about.css";

export default function AboutValues() {
  return (
    <>
      <Container className="my-5">
        <Row className="g-4">
          <Col md={3}>
            <Card className="text-center shadow border-0 p-4">
              <FaStar
                size={50}
                className="mx-auto"
                style={{ color: "#660ff1" }}
              />
              <h5 className="mt-3 fw-bold">Premium Quality</h5>
              <p className="text-muted">Professionally designed .</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow border-0 p-4">
              <FaUsers
                size={50}
                className="mx-auto"
                style={{ color: "#660ff1" }}
              />
              <h5 className="mt-3 fw-bold">Developer Friendly</h5>
              <p className="text-muted">Clean, documented code.</p>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="text-center shadow border-0 p-4">
              <FaShoppingCart
                size={50}
                className="mx-auto"
                style={{ color: "#660ff1" }}
              />
              <h5 className="mt-3 fw-bold">Wide Selection</h5>
              <p className="text-muted">Templates for every industry.</p>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow border-0 p-4">
              <FaShieldAlt
                size={50}
                className="mx-auto"
                style={{ color: "#660ff1" }}
              />
              <h5 className="mt-3 fw-bold">Secure Purchase</h5>
              <p className="text-muted">Safe & instant downloads.</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
