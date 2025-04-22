
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

import '../../styles/contact/contact.css';

export default function ContactHero() {
  return (
    <>
    <div className=" hero-section  text-white text-center d-flex flex-column justify-content-center align-items-center py-5">
      <Container>
      <h1 className=" display-3 fw-bold " style={{ color: '#660ff1' }} >Let's Connect!</h1>
      <p className="lead mt-3 fs-4 "  style={{ color: '#660ff1' }}>Have questions or need assistance? We’d love to hear from you!</p>
      <Link className="btn  btn-lg mt-3" to={'/'}  style={{ outline: '1px solid #660ff1' }}>Back To Home</Link>

      </Container>
    </div>
    </>
  )
}
