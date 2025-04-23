
import { Container, Row, Col, Card } from "react-bootstrap";

import img1 from '../../assets/images/about/1.jpg.png'
import img2 from '../../assets/images/about/2.jpg.png'
import img3 from'../../assets/images/about/3.jpg.png'
import about1 from'../../assets/images/about/about-1.webp'

import '../../styles/about/about.css';

export default function AboutOurTeam() {
  return (
    <>
        <Container className="my-5 text-center">
          <h2 className="fw-bold " style={{ color: '#660ff1' }}>Meet Our Team</h2>
          <p className="text-muted">Dedicated professionals making your shopping better.</p>
          <Row className="g-4">
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <Card.Img
                  variant="top"
                  src={img1}
                  className="rounded-circle mx-auto"
                  style={{ width: "100px" }}
                />
                <Card.Body>
                  <h5 className="fw-bold">Hussien Mahmoud</h5>
                  <p className="text-muted">Founder & CEO</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <Card.Img
                  variant="top"
                  src={img2}
                  className="rounded-circle mx-auto"
                  style={{ width: "100px" }}
                />
                <Card.Body>
                  <h5 className="fw-bold">Jane Smith</h5>
                  <p className="text-muted">Head of Marketing</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow border-0 p-4">
                <Card.Img
                  variant="top"
                  src={img3}
                  className="rounded-circle mx-auto"
                  style={{ width: "100px" }}
                />
                <Card.Body>
                  <h5 className="fw-bold">Mike Johnson</h5>
                  <p className="text-muted">Customer Support Lead</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
    </>
  )
}
