import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Accordion, Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchTags } from '../store/slices/productsSlice';
import { FiSearch, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import TemplateCard from '../components/TemplateCard';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Shop() {
  const dispatch = useDispatch();
  const { items: products, categories, tags, loading, error } = useSelector(state => state.products);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('latest');
  const [stats, setStats] = useState({
    templates: 0,
    categories: 0,
    customers: 0,
    downloads: 0
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, selectedCategory]);

  useEffect(() => {
    const calculateStats = () => {
      if (products && categories) {
        setStats({
          templates: products.length,
          categories: categories.length,
          customers: products.reduce((sum, product) => sum + (product.sales || 0), 0),
          downloads: products.reduce((sum, product) => sum + (product.downloads || 0), 0)
        });
      }
    };

    calculateStats();
  }, [products, categories]);

  // console.log("category"+category)
  console.log(products)
  const filteredTemplates = products?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.category_name
      === selectedCategory;
    const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) && 
                        (!priceRange.max || product.price <= Number(priceRange.max));
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getSortedTemplates = (templates) => {
    if (!templates) return [];
    
    return [...templates].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popularity':
          return (b.sales || 0) - (a.sales || 0);
        case 'latest':
        default:
          return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
      }
    });
  };

  const sortedAndFilteredTemplates = getSortedTemplates(filteredTemplates);

  const handleCategoryChange = (categoryId) => {
    // Prevent re-setting if already selected
    if (selectedCategory === categoryId) return;
    
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      setSearchParams({ category: categoryId });
    } else {
      // Clear search params without triggering a re-render
      setSearchParams({}, { replace: true });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const handleMinPriceChange = (value) => {
    setPriceRange(prev => ({ 
      ...prev, 
      min: value,
      max: prev.max && Number(value) > Number(prev.max) ? value : prev.max 
    }));
  };

  const handleMaxPriceChange = (value) => {
    setPriceRange(prev => ({ 
      ...prev, 
      max: value,
      min: prev.min && Number(value) < Number(prev.min) ? value : prev.min 
    }));
  };

  const sortOptions = [
    { name: 'Latest', value: 'latest' },
    { name: 'Price: Low to High', value: 'price-low' },
    { name: 'Price: High to Low', value: 'price-high' },
    { name: 'Top Rated', value: 'rating' },
    { name: 'Most Popular', value: 'popularity' }
  ];

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
    <>
      {/* Hero Section */}
      <div className="shop-hero position-relative overflow-hidden py-5">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeIn}
              >
                <h1 className="display-4 fw-bold mb-4" style={{ color: '#17254E' }}>
                  Discover Premium Templates
                </h1>
                <p className="lead mb-4" style={{ color: '#17254E' }}>
                  Browse through our collection of high-quality, responsive templates
                  designed to elevate your online presence.
                </p>
                
                {/* Advanced Search Bar */}
                <div className="search-bar-wrapper bg-white p-2 rounded-pill shadow-lg">
                  <Form className="d-flex align-items-center">
                    <div className="input-group border-0">
                      <span className="input-group-text bg-transparent border-0">
                        <FiSearch size={20} />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 shadow-none"
                      />
                      <Button 
                        variant="primary"
                        className="rounded-pill px-4"
                        style={{ backgroundColor: '#660ff1', border: 'none' }}
                      >
                        Search
                      </Button>
                    </div>
                  </Form>
                </div>

                {/* Popular Categories */}
                <div className="mt-4">
                  <div className="d-flex gap-2 flex-wrap">
                    {categories?.slice(0, 4).map((category) => (
                      <Button
                        key={category.id}
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => handleCategoryChange(category.name)}
                        style={{ borderColor: '#660ff1', color: '#660ff1' }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Col>

            {/* Stats Cards */}
            <Col lg={6}>
              <Row className="g-3">
                {[
                  { title: 'Templates', value: `${stats.templates}+`, color: '#FF6B6B' },
                  { title: 'Categories', value: `${stats.categories}+`, color: '#4ECDC4' },
                  { title: 'Customers', value: `${Math.floor(stats.customers/1000)}k+`, color: '#45B7D1' },
                  { title: 'Downloads', value: `${Math.floor(stats.downloads/1000)}k+`, color: '#96C93D' }
                ].map((stat, index) => (
                  <Col md={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="d-flex align-items-center">
                          <div 
                            className="rounded-circle p-3 me-3"
                            style={{ backgroundColor: `${stat.color}20` }}
                          >
                            <div 
                              className="rounded-circle p-2"
                              style={{ backgroundColor: stat.color }}
                            />
                          </div>
                          <div>
                            <h3 className="fw-bold mb-0">{stat.value}</h3>
                            <p className="text-muted mb-0">{stat.title}</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>

        {/* Background Decoration */}
        <div className="position-absolute top-0 end-0 mt-5">
          <svg width="350" height="350" viewBox="0 0 200 200">
            <path
              fill="#660ff120"
              d="M45.3,-59.1C58.9,-51.1,70.3,-37.4,73.8,-22.1C77.4,-6.8,73.1,10.2,65.1,24.5C57.1,38.9,45.3,50.5,31.8,57.7C18.3,64.9,3,67.6,-11.8,64.9C-26.7,62.2,-41.1,54,-52.1,42.1C-63.1,30.2,-70.7,14.6,-70.7,-1C-70.7,-16.7,-63,-32.3,-51.6,-40.4C-40.2,-48.5,-25,-49.1,-10.5,-51.9C4,-54.7,17.8,-59.8,31.7,-67.1C45.7,-74.4,59.8,-84,45.3,-59.1Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </div>

      {/* Rest of your existing code */}
      <Container className="py-5">

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
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}
