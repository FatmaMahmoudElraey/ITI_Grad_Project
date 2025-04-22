
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

import '../../styles/about/about.css';

export default function AboutReadyToBuild() {
  return (
    <>
        <Container className="text-center my-5">
          <h3 className="fw-bold">Ready to Build Your Website?</h3>
          <p className="text-muted">Browse our collection of premium templates today.</p>
          <Link to="/" className="btn btn-lg" style={{ backgroundColor: '#660ff1', border: 'none', color:'white' }}>
            View Templates
          </Link>
        </Container>
    </>
  )
}
