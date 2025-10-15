
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";


import '../../styles/about/about.css';


export default function AboutHero() {
  return (
    <>
        <div className=" hero-section  text-white text-center d-flex flex-column justify-content-center align-items-center py-5">
            <Container>
                <h1 className="display-3 fw-bold" style={{ color: '#660ff1' }}>About Us</h1>
                <p className="lead mt-3 fs-4" style={{ color: '#660ff1' }}>Discover Premium Website Templates for Your Next Project</p>
                <Link className="btn btn-lg mt-3" to={'/'} style={{ backgroundColor: '#660ff1', border: 'none', color:'white' }}>Back To Home</Link>
                
            </Container>
        </div>
    </>
  )
}
