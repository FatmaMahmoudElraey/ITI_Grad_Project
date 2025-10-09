import React from 'react';
import { Row, Col, Card, Form, Button, Accordion, Dropdown } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import TemplateCard from '../TemplateCard';

const ShopContent = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  categories,
  handleCategoryChange,
  priceRange,
  handleMinPriceChange,
  handleMaxPriceChange,
  handleClearFilters,
  loading,
  sortedAndFilteredTemplates,
  sortBy,
  setSortBy,
  sortOptions,
  currentPage,
  setCurrentPage,
  totalPages,
  next,
  previous
}) => {
  const searchInput = (
    <div className="mb-4">
      <Form.Group>
        <Form.Label>Search</Form.Label>
        <div className="input-group">
          <span className="input-group-text">
            <FiSearch />
          </span>
          <Form.Control
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Form.Group>
    </div>
  );

  return (
    <Row>
      {/* Filters Sidebar */}
      <Col lg={3} className="mb-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-white py-3">
            <h5 className="mb-0">Filters</h5>
          </Card.Header>
          <Card.Body>
            {searchInput}
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
          </Card.Body>
        </Card>
      </Col>

      {/* Templates Grid */}
      <Col lg={9}>
        <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded">
          <div>
            <strong>{sortedAndFilteredTemplates.length}</strong> templates found
          </div>
          <div className="d-flex align-items-center">
            <span className="me-2">Sort by:</span>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="sort-dropdown">
                {sortOptions.find(opt => opt.value === sortBy)?.name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {sortOptions.map(option => (
                  <Dropdown.Item
                    key={option.value}
                    active={sortBy === option.value}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border" style={{ color: '#660ff1' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading templates...</p>
          </div>
        ) : sortedAndFilteredTemplates.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2" />
            No templates found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <>
            <Row xs={1} md={2} lg={3} className="g-4">
              {sortedAndFilteredTemplates.map(template => (
                <Col key={template.id} className="mb-4">
                  <TemplateCard 
                    {...template}
                    reviews={template.reviews || []}
                    tags={template.tags || []}
                  />
                </Col>
              ))}
            </Row>
            {/* Pagination Controls */}
            <div className="d-flex justify-content-center align-items-center mt-4">
              <Button
                variant="outline-primary"
                className="me-2"
                disabled={currentPage === 1 || !previous}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "primary" : "outline-secondary"}
                  className="mx-1"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                className="ms-2"
                disabled={currentPage === totalPages || !next}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default ShopContent;