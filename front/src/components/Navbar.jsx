import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Form, Button, Modal, Badge, Offcanvas, NavDropdown } from 'react-bootstrap';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import Logo from '../assets/images/navbar/logo.png';
import '../assets/css/navbar/style.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalQuantity } = useSelector((state) => state.cart);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    setShowMobileSearch(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Links that we reuse (only one time defined)
  const navLinks = (
    <>
      <Nav.Link as={Link} to="/about" className="nav-link-item">
        <span>About Us</span>
      </Nav.Link>
      <Nav.Link as={Link} to="/contact" className="nav-link-item">
        <span>Contact Us</span>
      </Nav.Link>

      {isAuthenticated && user ? (
        <>
          <NavDropdown
            title={
              <div className="d-flex align-items-center">
                <FiUser className="me-1" />
                <span className="me-3">{user?.name || user?.email || 'User'}</span>
              </div>
            }
            id="nav-dropdown"
            className="nav-link-item custom-dropdown"
          >
            {user?.role && (user.role === 'admin' || user.role === 'seller') && (
              <NavDropdown.Item as={Link} to={`/${user.role}/dashboard`}>
                Dashboard
              </NavDropdown.Item>
            )}
            <NavDropdown.Item onClick={handleLogout}>
              <FiLogOut className="me-1" />
              Sign Out
            </NavDropdown.Item>
          </NavDropdown>

          <Nav.Link as={Link} to="/cart" className="nav-link-item position-relative">
            <div className="d-flex align-items-center">
              <FiShoppingCart size={20} />
              <span className="ms-1 d-none d-lg-inline">Cart</span>
              {totalQuantity > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="position-absolute"
                  style={{ top: '-5px', right: '-8px', fontSize: '0.6rem' }}
                >
                  {totalQuantity}
                </Badge>
              )}
            </div>
          </Nav.Link>
        </>
      ) : (
        <Nav.Link as={Link} to="/login" className="nav-link-item">
          <div className="d-flex align-items-center">
            <FiUser className="me-1" />
            <span>Sign in</span>
          </div>
        </Nav.Link>
      )}
    </>
  );

  return (
    <>
      {/* Top Navbar */}
      <Navbar
        expand="lg"
        bg="dark"
        data-bs-theme="dark"
        className={`bg-dark text-light py-2 top-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
        fixed="top"
      >
        <Container fluid>
          {/* Mobile Header */}
          <div className="d-flex w-100 align-items-center justify-content-between">
            {/* Logo */}
            <Navbar.Brand as={Link} to="/" className="text-light fw-bold d-flex align-items-center">
              <img
                alt="Logo"
                src={Logo}
                width="30"
                height="24"
                className="d-inline-block align-top me-2"
              />
              <span className="brand-text">WEBIFY</span>
            </Navbar.Brand>

            {/* Desktop Search Box - visible only on large screens */}
            <Form onSubmit={handleSearch} className="search-wrapper flex-grow-1 mx-4 d-none d-lg-block">
              <div className="d-flex align-items-center dropdown-search w-100">
                <div className="search-container position-relative flex-grow-1">
                  <FiSearch className="search-icon position-absolute top-50 translate-middle-y start-0 ms-3" />
                  <Form.Control
                    type="search"
                    placeholder="Search for items..."
                    className="search-box ps-5 pe-3 rounded-pill"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </Form>

            {/* Desktop Navigation Links - visible only on large screens */}
            <Nav className="ms-auto d-none d-lg-flex align-items-center">
              {navLinks}
              <Button variant="primary" className="header-button ms-2 rounded-pill">
                Get unlimited downloads
              </Button>
            </Nav>

            {/* Mobile Controls */}
            <div className="d-flex d-lg-none align-items-center">
              <FiSearch
                className="text-light mx-2 mobile-icon"
                size={22}
                onClick={() => setShowMobileSearch(true)}
              />
              {isAuthenticated && (
                <Nav.Link as={Link} to="/cart" className="text-light mx-2 position-relative p-0">
                  <FiShoppingCart size={22} />
                  {totalQuantity > 0 && (
                    <Badge
                      pill
                      bg="danger"
                      className="position-absolute"
                      style={{ top: '-5px', right: '-8px', fontSize: '0.6rem' }}
                    >
                      {totalQuantity}
                    </Badge>
                  )}
                </Nav.Link>
              )}
              <Button
                variant="link"
                className="text-light p-0 ms-2 border-0"
                onClick={() => setShowOffcanvas(true)}
              >
                <FiMenu size={24} />
              </Button>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Search Modal */}
      <Modal
        show={showMobileSearch}
        onHide={() => setShowMobileSearch(false)}
        className="mobile-search-modal"
        centered
        animation
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
                className="search-box ps-5 rounded-pill"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3 header-button rounded-pill"
            >
              Search
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="bg-dark text-light"
      >
        <Offcanvas.Header className="border-bottom border-secondary">
          <Offcanvas.Title className="d-flex align-items-center">
            <img
              alt="Logo"
              src={Logo}
              width="30"
              height="24"
              className="d-inline-block align-top me-2"
            />
            <span className="fw-bold">WEBIFY</span>
          </Offcanvas.Title>
          <Button
            variant="link"
            className="text-light p-0 border-0"
            onClick={() => setShowOffcanvas(false)}
          >
            <FiX size={24} />
          </Button>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column mb-4">
            {navLinks}
          </Nav>
          <Button variant="primary" className="w-100 header-button rounded-pill mb-3">
            Get unlimited downloads
          </Button>

          <div className="mt-4 pt-3 border-top border-secondary">
            <h6 className="text-light mb-3">Categories</h6>
            <Nav className="flex-column">
              <Nav.Link as={Link} to="/shop" className="mobile-category-link py-2">Shop</Nav.Link>
              <Nav.Link as={Link} to="#video-templates" className="mobile-category-link py-2">Video Templates</Nav.Link>
              <Nav.Link as={Link} to="#music" className="mobile-category-link py-2">Music</Nav.Link>
              <Nav.Link as={Link} to="#sound-effects" className="mobile-category-link py-2">Sound Effects</Nav.Link>
              <Nav.Link as={Link} to="#graphic-templates" className="mobile-category-link py-2">Graphic Templates</Nav.Link>
              <Nav.Link as={Link} to="#graphics" className="mobile-category-link py-2">Graphics</Nav.Link>
              <Nav.Link as={Link} to="#3d" className="mobile-category-link py-2">3D</Nav.Link>
              <Nav.Link as={Link} to="#presentation-templates" className="mobile-category-link py-2">Presentation Templates</Nav.Link>
              <Nav.Link as={Link} to="#add-ons" className="mobile-category-link py-2">Add-ons</Nav.Link>
              <Nav.Link as={Link} to="#more" className="mobile-category-link py-2">More</Nav.Link>
            </Nav>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Bottom Navbar - Categories - Only visible on desktop */}
      <Navbar
        expand="lg"
        bg="dark"
        data-bs-theme="dark"
        className={`second-navbar py-1 d-none d-lg-block ${isScrolled ? 'second-navbar-scrolled' : ''}`}
        style={{ marginTop: '56px' }}
      >
        <Container fluid>
          <Navbar.Collapse id="secondNavbar">
            <Nav className="mx-auto flex-wrap justify-content-center">
              <Nav.Link as={Link} to="/shop" className="category-link mx-2">Shop</Nav.Link>
              <Nav.Link as={Link} to="#video-templates" className="category-link mx-2">Video Templates</Nav.Link>
              <Nav.Link as={Link} to="#music" className="category-link mx-2">Music</Nav.Link>
              <Nav.Link as={Link} to="#sound-effects" className="category-link mx-2">Sound Effects</Nav.Link>
              <Nav.Link as={Link} to="#graphic-templates" className="category-link mx-2">Graphic Templates</Nav.Link>
              <Nav.Link as={Link} to="#graphics" className="category-link mx-2">Graphics</Nav.Link>
              <Nav.Link as={Link} to="#3d" className="category-link mx-2">3D</Nav.Link>
              <Nav.Link as={Link} to="#presentation-templates" className="category-link mx-2">Presentation Templates</Nav.Link>
              <Nav.Link as={Link} to="#add-ons" className="category-link mx-2">Add-ons</Nav.Link>
              <Nav.Link as={Link} to="#more" className="category-link mx-2">More</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Spacer for fixed navbar on mobile */}
      <div className="navbar-spacer d-lg-none" style={{ height: '56px' }}></div>
    </>
  );
}
