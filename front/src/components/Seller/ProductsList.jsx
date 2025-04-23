import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import '../../assets/css/dashboard/dash.css';

export default function ProductsList({ products, onDelete, onEdit, onAddProduct, isLoading }) {
  return (
    <div className="products-grid">
      {isLoading ? (
        <div className="loading-overlay">  <div className="loading-spinner"></div>
</div>
      ) : products.length > 0 ? (
        products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDelete={onDelete} 
            onEdit={onEdit} 
          />
        ))
      ) : (
        <div className="empty-state">
          <p>No products found</p>
          <button onClick={onAddProduct} className="button primary-button">
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
}

ProductsList.propTypes = {
  products: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddProduct: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};