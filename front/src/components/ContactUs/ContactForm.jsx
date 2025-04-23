import React from 'react'
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

import '../../styles/contact/contact.css';

export default function ContactForm() {
  return (
    <>
        <Container className="my-5">
          <Row className="g-4">
            {/* Contact Form */}
            <Col md={7}>
              <Card className="shadow-lg border-0 p-4">
                <Card.Body>
                  <h3 className="fw-bold text-center mb-4">Send a Message</h3>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter your name" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" placeholder="Enter your email" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control type="text" placeholder="Subject" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Message</Form.Label>
                      <Form.Control as="textarea" rows={4} placeholder="Write your message here..." />
                    </Form.Group>
                    <Button style={{ backgroundColor: '#660ff1', border: 'none' }}  className="w-100">Send Message</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
    
            {/* Contact Info */}
            <Col md={5}>
              <Card className="shadow-lg border-0 p-4 bg-light">
                <Card.Body>
                  <h3 className="fw-bold text-center mb-4">Contact Information</h3>
                  <p className="text-muted text-center mb-4">Feel free to reach out to us via phone, email, or visit us.</p>
    
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaMapMarkerAlt size={24} style={{ color: '#660ff1' }}  />
                      <h6 className="fw-bold ">Our Location</h6>
                    </div>
                    <p className="text-muted ps-4 mb-2">123 Street, City, Country</p>
                  </div>
    
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaPhone size={24} style={{ color: '#660ff1' }}  />
                      <h6 className="fw-bold ">Call Us</h6>
                    </div>
                    <p className="text-muted ps-4 mb-2">+1 234 567 890</p>
                  </div>

                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaEnvelope size={24} style={{ color: '#660ff1' }}  />
                      <h6 className="fw-bold ">Email Us</h6>
                    </div>
                    <p className="text-muted ps-4 mb-2">WEBIFY@mail.com</p>
                  </div>
    
                  <div className="d-flex flex-column mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <FaClock size={24} style={{ color: '#660ff1' }}  />
                      <h6 className="fw-bold ">Working Hours</h6>
                    </div>
                    <p className="text-muted mb-1 ps-4">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted ps-4 mb-2">Sat - Sun: Closed</p>
                  </div>
    
                  <div className="d-flex justify-content-center mt-4 gap-4">
                    <Link to="#" className="text-primary"><FaFacebook size={30} /></Link>
                    <Link to="#" className="text-info"><FaTwitter size={30} /></Link>
                    <Link to="#" className="text-primary"><FaLinkedin size={30} /></Link>
                    <Link to="#" className="text-danger"><FaInstagram size={30} /></Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
    </>
  )
}
