import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchTags } from '../store/slices/productsSlice';
import FeaturedProducts from '../components/FeaturedProducts';
import LatestProducts from '../components/LatestProducts';
import ShopContent from '../components/Shop/ShopContent';
import HeroSection from '../components/Shop/HeroSection';

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

  return (
    <>
      <HeroSection 
        categories={categories}
        stats={stats}
        handleCategoryChange={handleCategoryChange}
      />

      <Container className="my-5">
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
        />

        <FeaturedProducts />
        <LatestProducts />
      </Container>
    </>
  );
}
