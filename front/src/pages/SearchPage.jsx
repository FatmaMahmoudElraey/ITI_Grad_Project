import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchProducts } from '../store/slices/productsSlice';
import TemplateCard from '../components/TemplateCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const searchQuery = query.get('query');
  const dispatch = useDispatch();
  const { 
    searchResults,
    searchLoading,
    searchError 
  } = useSelector((state) => state.products);

  useEffect(() => {
    if (searchQuery) {
      dispatch(searchProducts(searchQuery));
    } else {
      // Optionally, clear results or set a default state if no query
      // For now, productsSlice handles clearing on new pending search
    }
  }, [searchQuery, dispatch]);

  if (searchLoading) {
    return <div className="container mt-5"><p>Loading search results...</p></div>;
  }

  if (searchError) {
    return <div className="container mt-5"><p>Error loading search results: {typeof searchError === 'string' ? searchError : searchError.message || 'An unexpected error occurred'}</p></div>;
  }

  return (
    <div className="container mt-5" style={{height:"100vh"}}>
      <h1>Search Results for "{searchQuery}"</h1>
      {searchResults.length === 0 && !searchLoading && (
        <p>No products found for "{searchQuery}".</p>
      )}

      {searchResults.length > 0 && (
        <section>
          <h2 className='mb-3'>Products</h2>
          <div className="row">
            {searchResults.map(product => (
              <div key={product.id} className="col-md-4 mb-4">
                <TemplateCard {...product} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
