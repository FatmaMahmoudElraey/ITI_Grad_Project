import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Form, Button, Modal, Badge, Offcanvas, NavDropdown } from 'react-bootstrap';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { fetchCategories } from '../store/slices/productsSlice';
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
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state) => state.products);

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
    dispatch(fetchCategories());
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      <Nav.Link as={Link} to="/shop" className="nav-link-item me-2">
        <span>Shop</span>
      </Nav.Link>
      <NavDropdown title="Categories" id="categories-dropdown" className="nav-link-item custom-dropdown me-2">
        {categoriesLoading && <NavDropdown.Item disabled>Loading...</NavDropdown.Item>}
        {categoriesError && <NavDropdown.Item disabled>Error loading</NavDropdown.Item>}
        {!categoriesLoading && !categoriesError && categories && categories.length === 0 && (
          <NavDropdown.Item disabled>No categories found</NavDropdown.Item>
        )}
        {!categoriesLoading && !categoriesError && categories && categories.map((category) => (
          <NavDropdown.Item key={category.id} as={Link} to={`/category/${category.name}`}>
            {category.name}
          </NavDropdown.Item>
        ))}
      </NavDropdown>
      <Nav.Link as={Link} to="/blogs" className="nav-link-item me-2">
        <span>Blog</span>
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
            <NavDropdown.Item as={Link} to="/profile">
              <FiUser className="me-1" />
              Profile
            </NavDropdown.Item>
            <NavDropdown.Item onClick={handleLogout}>
              <FiLogOut className="me-1" />
              Sign Out
            </NavDropdown.Item>
          </NavDropdown>

          <Nav.Link as={Link} to="/cart" className="nav-link-item position-relative">
            <div className="d-flex align-items-center ms-2">
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
        className={`bg-dark text-light py-3 top-navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
        
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
              <span className="brand-text fw-bold">WEBIFY</span>
            </Navbar.Brand>

            {/* Desktop Search Box - visible only on large screens */}
            <Form onSubmit={handleSearch} className="search-wrapper flex-grow-1 mx-4 d-none d-lg-block" style={{ maxWidth: '550px' }}>
              <div className="d-flex align-items-center dropdown-search w-100" style={{ minWidth: '1100px' }}>
                <div className="search-container position-relative flex-grow-1">
                  <FiSearch className="search-icon position-absolute top-50 translate-middle-y start-0 ms-3" />
                  <Form.Control
                    type="search"
                    placeholder="Search for items..."
                    className="search-box ps-5 pe-3 rounded-pill"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ minWidth: '900px' }} // Added minWidth to make it wider
                  />
                </div>
              </div>
            </Form>

            {/* Desktop Navigation Links - visible only on large screens */}
            <Nav className="ms-auto d-none d-lg-flex align-items-center">
              {navLinks}
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
        centered
        dialogClassName="mobile-search-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center">Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSearch} className="w-100">
            <div className="search-container position-relative">
              <FiSearch className="search-icon position-absolute top-50 translate-middle-y start-0 ms-3" />
              <Form.Control
                type="search"
                placeholder="Search for items..."
                className="search-box ps-5 pe-3 rounded-pill"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button variant="primary" type="submit" className="w-100 mt-3 rounded-pill">
              Search
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Offcanvas Menu for Mobile */}
      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" className="bg-dark text-light">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <img alt="Logo" src={Logo} width="30" height="24" className="me-2" />
            WEBIFY
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column flex-grow-1">
            {navLinks} {/* Use the same navLinks for consistency */}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Spacer for fixed navbar on mobile */}
      <div className="navbar-spacer d-lg-none" style={{ height: '56px' }}></div>
    </>
  );
}
