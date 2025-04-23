import { Container, Row, Col, Card } from "react-bootstrap";
import { 
  FaDownload,
  FaDollarSign,
  FaHeadset,
  FaSync
} from "react-icons/fa";

import '../../styles/about/about.css';

export default function AboutFeatures() {
  return (
    <>
        <Container className="my-5 bg-body-tertiary">
          <Row className="align-items-center">
            {/* Left Image */}
            <Col md={6} className="text-center mb-4 mb-md-0">
              <img
                src="https://cdn.pixabay.com/photo/2018/05/18/15/30/web-design-3411373_1280.jpg"
                alt="Online Shopping"
                style={{ height: "450px", width: "100%" }}
                className="img-fluid rounded"
              />
            </Col>
    
            {/* Right Features */}
            <Col md={6}>
              <h5 className=" fw-bold fs-3 alert " style={{ color: '#660ff1' }}>About Us</h5>
              <h2 className="fw-bold text-black-50">
                Your One-Stop Template Marketplace
              </h2>
              <p className="text-muted">
                We offer a curated collection of high-quality website templates and themes. 
                From business websites to e-commerce solutions, find the perfect template 
                to kickstart your next web project.
              </p>
    
              <Row>
                <Col xs={6} className="mb-3">
                  <Card className="p-3 border-0 shadow-sm text-center align-items-center">
                    <FaDownload size={30} style={{ color: '#4CAF50' }} />
                    <h6 className="mt-2 fw-bold">Instant Download</h6>
                  </Card>
                </Col>
                <Col xs={6} className="mb-3">
                  <Card className="p-3 border-0 shadow-sm text-center align-items-center">
                    <FaDollarSign size={30} style={{ color: '#FF5722' }} />
                    <h6 className="mt-2 fw-bold">Best Value</h6>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="p-3 border-0 shadow-sm text-center align-items-center">
                    <FaHeadset size={30} style={{ color: '#2196F3' }} />
                    <h6 className="mt-2 fw-bold">Technical Support</h6>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className="p-3 border-0 shadow-sm text-center align-items-center">
                    <FaSync size={30} style={{ color: '#660ff1' }} />
                    <h6 className="mt-2 fw-bold">Regular Updates</h6>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
    </>
  )
}
