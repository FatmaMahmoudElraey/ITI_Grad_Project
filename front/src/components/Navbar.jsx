import React from 'react';
import { Navbar, Container, NavDropdown, Nav } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi'; 
import { FaArrowRightLong  } from "react-icons/fa6";

import Logo from '../assets/images/navbar/logo.png'; 
import '../assets/css/navbar/style.css';

export default function Header() {
  return (
    <>
    <Navbar expand="lg" className="bg-dark text-light py-2">
      <Container fluid>
        
        {/* Logo & Brand Name */}
        <Navbar.Brand href="/" className="ms-3 text-light fw-bold fs-3 d-flex align-items-center">
          <img
            alt=""
            src={Logo}
            width="45"
            height="35"
            className="d-inline-block align-top me-2"
          />
          <span>WEBIFY</span>
        </Navbar.Brand>

        {/* Navbar Toggle for Mobile */}
        <Navbar.Toggle aria-controls="navbarScroll" className="border-0 bg-transparent" />

        <Navbar.Collapse id="navbarScroll" className="justify-content-between">
          
          {/* Search Box with Dropdown & Icon */}
          <div className="search-wrapper mx-auto">
            <div className="d-flex align-items-center  dropdown-search">
              <NavDropdown title="All Items" id="navbarScrollingDropdown" className="px-2 items ">
                <NavDropdown.Item href="#action3" className='bg-dark text-light'>All Items</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Stock Video</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Video Templates</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Music</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Sound Effects</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Graphic Templates</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Graphics</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>3D</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Presentation Templates</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Photos</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Fonts</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Add-ons</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>Web Templates</NavDropdown.Item>
                <NavDropdown.Item href="#action4" className='bg-dark text-light'>CMS Templates</NavDropdown.Item>
                <NavDropdown.Item href="#action5" className='bg-dark text-light'>WordPress</NavDropdown.Item>
              </NavDropdown>

              <div className="search-container">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="form-control search-box px-3" 
                  aria-label="Search" 
                />
              </div>
            </div>
          </div>

          {/* Right-side Links */}
          <Nav className="d-flex align-items-center">
            <Nav.Link href="/about" className="text-light me-3">AboutUs</Nav.Link>
            <Nav.Link href="/contact" className="text-light me-3">ContactUs</Nav.Link>
            <button className="header-button" style={{ backgroundColor: '#660ff1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
              Get unlimited downloads
            </button>
            <a className="sign-in mx-3 text-decoration-none text-light" href="#">Sign in</a>
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    <Navbar bg="dark" data-bs-theme="dark">
          <Nav className="me-auto ms-2">
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Stock Video" id="stockVideoDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Stock Footage</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Motion Graphics</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Stock Video <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Video Templates" id="videoTemplatesDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">After Effects</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Premiere Pro</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Apple Motion</NavDropdown.Item>
            <NavDropdown.Item href="#action4">Find Cut Pro</NavDropdown.Item>
            <NavDropdown.Item href="#action5">DeVinci Resolve</NavDropdown.Item>
            <NavDropdown.Item href="#action6">All Video Templates <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Music" id="musicDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Royalty-Free Music</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Logos & Idents</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Music <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Sound Effects" id="stockVideoDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Game Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Transitions & Movement</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Domestic Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Human Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Urban Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Natural Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Futuristic Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Interface Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Cartoon Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Industrial Sounds</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Sounds Packs</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Miscellaneous</NavDropdown.Item>
            <NavDropdown.Item href="#action3">Sound</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Sound Effects <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Graphic Templates" id="videoTemplatesDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Adobe Photoshope</NavDropdown.Item>
            <NavDropdown.Item href="#action1">Adobe Illustrator</NavDropdown.Item>
            <NavDropdown.Item href="#action1">Adobe InDesign</NavDropdown.Item>
            <NavDropdown.Item href="#action1">Adobe XD</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Figma</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Sketch</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Canva</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Microsoft Word</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Graphic Templates <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Graphics" id="musicDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Backgrounds</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Textures</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Social</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Patterns</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Icons</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Objects</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Illustrations</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Graphics <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="3D" id="stockVideoDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Models</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Templates</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Renders</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All 3D <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Presentaion Templates" id="videoTemplatesDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Keynote</NavDropdown.Item>
            <NavDropdown.Item href="#action2">PowerPoint</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Google Slides</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Presentaion Templates <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#pricing" className='link'>Photos</Nav.Link>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Fonts" id="stockVideoDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Serif</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Sans-Serif</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Script and Handwritten</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Decorative</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Fonts <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="Add-ons" id="videoTemplatesDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Adobe Photoshop</NavDropdown.Item>
            <NavDropdown.Item href="#action1">Adobe Lightroom</NavDropdown.Item>
            <NavDropdown.Item href="#action1">Adobe Illustrator</NavDropdown.Item>
            <NavDropdown.Item href="#action2">Procreate</NavDropdown.Item>
            <NavDropdown.Item href="#action3">All Add-ons <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
          </NavDropdown>
          <NavDropdown  onClick={(e) => e.preventDefault()} title="More" id="musicDropdown" className="link text-light">
            <NavDropdown.Item href="#action1">Web Templates <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
            <NavDropdown.Item href="#action1">CMS Templates <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
            <NavDropdown.Item href="#action2">WordPress <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
            <NavDropdown.Item href="#action3">Extensions <FaArrowRightLong className='ms-2' /></NavDropdown.Item>
            <NavDropdown.Item href="#action3">Free Files </NavDropdown.Item>
            <NavDropdown.Item href="#action3">Popular Searches</NavDropdown.Item>
          </NavDropdown>
            
          </Nav>
          <Nav.Link href="#pricing" className='me-5 learn text-light'>Learn</Nav.Link>

      </Navbar>
    <></>
    </>
  );
}
