import React from 'react';
import { Button, Accordion, Form, Offcanvas } from 'react-bootstrap';
import { FiFilter, FiSearch } from 'react-icons/fi';

const MobileShopNav = ({
  show, onHide,
  searchTerm, setSearchTerm,
  selectedCategory, categories, handleCategoryChange,
  priceRange, handleMinPriceChange, handleMaxPriceChange,
  handleClearFilters
}) => {
  return (
    <Offcanvas show={show} onHide={onHide} placement="bottom" className="d-lg-none" style={{height: '90vh'}}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><FiFilter className="me-2" />Filters</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="mb-4">
          <Form.Group>
            <Form.Label>Search</Form.Label>
            <div className="input-group">
              <span className="input-group-text"><FiSearch /></span>
              <Form.Control
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Form.Group>
        </div>
        <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Categories</Accordion.Header>
            <Accordion.Body>
              <div className="d-grid gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'primary' : 'outline-secondary'}
                  className="text-start"
                  onClick={() => handleCategoryChange('all')}
                  style={{ backgroundColor: selectedCategory === 'all' ? '#660ff1' : '' }}
                >
                  All Categories
                </Button>
                {categories?.map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory === cat.name ? 'primary' : 'outline-secondary'}
                    className="text-start"
                    onClick={() => handleCategoryChange(cat.name)}
                    style={{ backgroundColor: selectedCategory === cat.name ? '#660ff1' : '' }}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Price Range</Accordion.Header>
            <Accordion.Body>
              <Form.Label>Price: ${priceRange.min || 0} - ${priceRange.max || 1000}</Form.Label>
              <div className="d-flex gap-2 mb-3">
                <Form.Control
                  type="number"
                  value={priceRange.min}
                  min={0}
                  max={priceRange.max || 1000}
                  onChange={(e) => handleMinPriceChange(e.target.value)}
                />
                <span className="my-auto">-</span>
                <Form.Control
                  type="number"
                  value={priceRange.max}
                  min={priceRange.min || 0}
                  max={1000}
                  onChange={(e) => handleMaxPriceChange(e.target.value)}
                />
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Button
          variant="outline-secondary"
          className="w-100 mt-3"
          onClick={handleClearFilters}
        >
          Clear All Filters
        </Button>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MobileShopNav;
