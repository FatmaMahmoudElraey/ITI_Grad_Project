import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchProducts } from '../store/slices/productsSlice';

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
    <div className="container mt-5" style={{height:"70vh"}}>
      <h1>Search Results for "{searchQuery}"</h1>
      {searchResults.length === 0 && !searchLoading && (
        <p>No products found for "{searchQuery}".</p>
      )}

      {searchResults.length > 0 && (
        <section>
          <h2>Products</h2>
          <div className="row">
            {searchResults.map(product => (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  {product.photo && (
                    <Link to={`/product-details/${product.id}`}>
                      <img src={product.photo} className="card-img-top" alt={product.title} style={{ height: '200px', objectFit: 'cover' }} />
                    </Link>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      <Link to={`/product-details/${product.id}`} className="text-decoration-none text-dark">{product.title}</Link>
                    </h5>
                    <p className="card-text text-muted small">Category: {product.category_name || 'N/A'}</p>
                    <p className="card-text">{product.description ? `${product.description.substring(0, 100)}...` : 'No description available.'}</p>
                    <div className="mt-auto">
                      <p className="card-text fs-5 fw-bold">${parseFloat(product.price).toFixed(2)}</p>
                      <Link to={`/product-details/${product.id}`} className="btn btn-primary w-100">View Details</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
