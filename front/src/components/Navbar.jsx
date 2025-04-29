import React, { useState } from 'react';
import { Navbar, Container, Nav, Form, Button, Modal } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import Logo from '../assets/images/navbar/logo.png';
import '../assets/css/navbar/style.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setShowMobileSearch(false);
  };

  // Links that we reuse (only one time defined)
  const navLinks = (
    <>
      <Nav.Link href="/about" className="text-light py-2">About Us</Nav.Link>
      <Nav.Link href="/contact" className="text-light py-2">Contact Us</Nav.Link>
      <Nav.Link href="/login" className="text-light py-2">Sign in</Nav.Link>
    </>
  );

  return (
    <>
      {/* Top Navbar */}
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="bg-dark text-light py-2 top-navbar">
        <Container fluid>
          {/* Mobile Header - visible only on small screens */}
          <div className="d-flex d-lg-none w-100 align-items-center">
            {/* Logo on left */}
            <Navbar.Brand href="/" className="text-light fw-bold d-flex align-items-center me-auto">
              <img
                alt="Logo"
                src={Logo}
                width="30"
                height="24"
                className="d-inline-block align-top"
              />
            </Navbar.Brand>

            {/* Centered search and button */}
            <div className="d-flex align-items-center mobile-center-group">
              <FiSearch 
                className="text-light me-3 mobile-search-icon" 
                size={20} 
                onClick={() => setShowMobileSearch(true)}
              />
              <Button variant="primary" className="header-button mobile-button" size="sm">
                Get unlimited downloads
              </Button>
            </div>

            {/* Burger menu on right */}
            <Navbar.Toggle aria-controls="mainNavbar" className="border-0 bg-transparent ms-2" />
          </div>

          {/* Desktop Layout - visible only on large screens */}
          <div className="d-none d-lg-flex w-100 align-items-center">
            <Navbar.Brand href="/" className="text-light fw-bold fs-4 d-flex align-items-center me-3">
              <img
                alt="Logo"
                src={Logo}
                width="40"
                height="32"
                className="d-inline-block align-top me-2"
              />
              <span>WEBIFY</span>
            </Navbar.Brand>

            {/* Search Box */}
            <Form onSubmit={handleSearch} className="search-wrapper flex-grow-1 mx-3">
              <div className="d-flex align-items-center dropdown-search w-100">
                <div className="search-container position-relative flex-grow-1">
                  <FiSearch className="search-icon position-absolute top-50 translate-middle-y end-0 me-2" />
                  <Form.Control
                    type="search"
                    placeholder="Search for items..."
                    className="search-box ps-3 pe-4"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </Form>

            {/* Right-side Links */}
            <Nav className="d-flex align-items-center">
              {navLinks}
              <Button variant="primary" className="header-button ms-3">
                Get unlimited downloads
              </Button>
            </Nav>
          </div>

          {/* Mobile Collapsible Menu */}
          <Navbar.Collapse id="mainNavbar" className="d-lg-none mt-2">
            <Nav className="flex-column  d-lg-none">
              {navLinks}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Search Modal */}
      <Modal 
        show={showMobileSearch} 
        onHide={() => setShowMobileSearch(false)}
        className="mobile-search-modal"
      >
        <Modal.Header closeButton className="bg-dark text-light border-0">
          <Modal.Title>Search</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form onSubmit={handleSearch}>
            <div className="search-container position-relative">
              <FiSearch className="search-icon position-absolute top-50 translate-middle-y start-0 ms-3" />
              <Form.Control
                type="search"
                placeholder="Search for items..."
                className="search-box ps-5"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-3 header-button"
            >
              Search
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Bottom Navbar */}
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" className="second-navbar py-1">
        <Container fluid>
          <Navbar.Toggle aria-controls="secondNavbar" className="border-0 bg-transparent ms-auto" />
          <Navbar.Collapse id="secondNavbar">
            <Nav className="me-auto flex-wrap">
              <Nav.Link href="/shop" className="link text-light mx-lg-1 mx-xl-2">Shop</Nav.Link>
              <Nav.Link href="#video-templates" className="link text-light mx-lg-1 mx-xl-2">Video Templates</Nav.Link>
              <Nav.Link href="#music" className="link text-light mx-lg-1 mx-xl-2">Music</Nav.Link>
              <Nav.Link href="#sound-effects" className="link text-light mx-lg-1 mx-xl-2">Sound Effects</Nav.Link>
              <Nav.Link href="#graphic-templates" className="link text-light mx-lg-1 mx-xl-2">Graphic Templates</Nav.Link>
              <Nav.Link href="#graphics" className="link text-light mx-lg-1 mx-xl-2">Graphics</Nav.Link>
              <Nav.Link href="#3d" className="link text-light mx-lg-1 mx-xl-2">3D</Nav.Link>
              <Nav.Link href="#presentation-templates" className="link text-light mx-lg-1 mx-xl-2">Presentation Templates</Nav.Link>
              <Nav.Link href="#add-ons" className="link text-light mx-lg-1 mx-xl-2">Add-ons</Nav.Link>
              <Nav.Link href="#more" className="link text-light mx-lg-1 mx-xl-2">More</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
