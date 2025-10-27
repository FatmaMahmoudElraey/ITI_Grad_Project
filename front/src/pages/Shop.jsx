import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchTags } from '../store/slices/productsSlice';
import FeaturedProducts from '../components/FeaturedProducts';
import LatestProducts from '../components/LatestProducts';
import ShopContent from '../components/Shop/ShopContent';
import HeroSection from '../components/Shop/HeroSection';
import MobileShopNav from '../components/Shop/MobileShopNav';
import TemplateCard from '../components/TemplateCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function Shop() {
  const dispatch = useDispatch();
  const { items: products, categories, tags, loading, error, count, next, previous, page_size } = useSelector(state => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = page_size || 10; // fallback to 10
  const totalPages = Math.ceil(count / pageSize);
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage }));
    dispatch(fetchCategories());
    dispatch(fetchTags());
  }, [dispatch, currentPage]);

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
          templates: typeof count === 'number' ? count : (products?.length || 0),
          categories: categories?.length || 0,
          customers: products?.reduce((sum, product) => sum + (product.customers || product.sales || 0), 0) || 0,
          downloads: products?.reduce((sum, product) => sum + (product.downloads || 0), 0) || 0
        });
      }
    };

    calculateStats();
  }, [products, categories]);

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
    if (selectedCategory === categoryId) return;
    
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      setSearchParams({ category: categoryId });
    } else {
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

  return (
    <>
      <HeroSection 
        categories={categories}
        stats={stats}
        handleCategoryChange={handleCategoryChange}
      />

      {/* Mobile Filters Button */}
      <div className="d-lg-none text-center mb-2">
        <button className="btn btn-outline-primary" onClick={() => setShowMobileFilters(true)}>
          <span className="me-2"><i className="bi bi-funnel" /></span>Filters
        </button>
      </div>

      {/* Mobile Filters Offcanvas */}
      <MobileShopNav
        show={showMobileFilters}
        onHide={() => setShowMobileFilters(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        categories={categories}
        handleCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        handleMinPriceChange={handleMinPriceChange}
        handleMaxPriceChange={handleMaxPriceChange}
        handleClearFilters={handleClearFilters}
      />

      <Container className="my-2">
        {/* Desktop ShopContent (with sidebar filters) only on lg+ */}
        <div className="d-none d-lg-block">
          <ShopContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            handleCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            handleMinPriceChange={handleMinPriceChange}
            handleMaxPriceChange={handleMaxPriceChange}
            handleClearFilters={handleClearFilters}
            loading={loading}
            sortedAndFilteredTemplates={sortedAndFilteredTemplates}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOptions={sortOptions}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            next={next}
            previous={previous}
          />
        </div>
        {/* Mobile template grid only (filters are in offcanvas) */}
        <div className="d-lg-none">
          {/* Only the grid and sort bar, not the sidebar */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded">
            <div>
              <strong>{sortedAndFilteredTemplates.length}</strong> templates found
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Sort by:</span>
              <select
                className="form-select"
                style={{ maxWidth: 160 }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.name}</option>
                ))}
              </select>
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
              <Swiper
  spaceBetween={16}
  slidesPerView={1.2}
  breakpoints={{
    480: { slidesPerView: 1.2 },
    600: { slidesPerView: 2 },
    768: { slidesPerView: 2.2 },
  }}
>
  {sortedAndFilteredTemplates.map(template => (
    <SwiperSlide key={template.id}>
      <div className="mb-4">
        <TemplateCard {...template} reviews={template.reviews || []} tags={template.tags || []} />
      </div>
    </SwiperSlide>
  ))}
</Swiper>
              {/* Pagination Controls */}
              <div className="d-flex justify-content-center align-items-center mt-4">
                <button
                  className="btn btn-outline-primary me-2"
                  disabled={currentPage === 1 || !previous}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`btn mx-1 ${currentPage === pageNum ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  className="btn btn-outline-primary ms-2"
                  disabled={currentPage === totalPages || !next}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
        <FeaturedProducts />
        <LatestProducts />
      </Container>
    </>
  );
}
