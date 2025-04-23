import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Seller/Sidebar';
import { FiUpload, FiX } from 'react-icons/fi';
import dashboardData from "../../assets/data/dashboardData.json";
import '../../assets/css/dashboard/dash.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '0',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    else if (formData.name.length > 100) newErrors.name = 'Name must be less than 100 characters';
    
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price)) newErrors.price = 'Price must be a number';
    else if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (isNaN(formData.stock)) newErrors.stock = 'Stock must be a number';
    else if (parseInt(formData.stock) < 0) newErrors.stock = 'Stock cannot be negative';
    
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    const validImages = files.filter(file => 
      file.type.match('image.*') && file.size <= 5 * 1024 * 1024
    );

    if (validImages.length !== files.length) {
      setErrors(prev => ({ ...prev, images: 'Only images under 5MB are allowed' }));
    } else {
      setErrors(prev => ({ ...prev, images: '' }));
    }

    const previews = validImages.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validImages]
    }));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get existing products from localStorage or JSON
      const existingProducts = JSON.parse(localStorage.getItem('sellerProducts')) || 
                             dashboardData.popularProducts;
      
      const newProduct = {
        ...formData,
        id: Math.max(...existingProducts.map(p => p.id), 0) + 1,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        imageUrls: [] // In real app, these would be URLs from your server
      };

      const updatedProducts = [...existingProducts, newProduct];
      
      // Save to localStorage
      localStorage.setItem('sellerProducts', JSON.stringify(updatedProducts));
      
      navigate('/seller/products', { 
        state: { 
          message: 'Product added successfully!',
          messageType: 'success'
        } 
      });
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors({
        submit: 'Failed to add product. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Add New Product</h1>
        </div>
        
        <div className="form-card">
          {errors.submit && (
            <div className="alert error">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'invalid' : ''}
                  placeholder="Enter product name"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="product-category">Category *</label>
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'invalid' : ''}
                >
                  <option value="">Select a category</option>
                  {dashboardData.categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="product-price">Price ($) *</label>
                <input
                  id="product-price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? 'invalid' : ''}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && <span className="error-message">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="product-stock">Stock Quantity</label>
                <input
                  id="product-stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={errors.stock ? 'invalid' : ''}
                  min="0"
                  placeholder="0"
                />
                {errors.stock && <span className="error-message">{errors.stock}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Product description (optional)"
                />
              </div>

              <div className="form-group full-width">
                <label>Product Images *</label>
                <div className="image-upload-box">
                  <label className="upload-button">
                    <FiUpload className="icon" />
                    <span>Choose Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="upload-note">Max 5 images (5MB each)</p>
                  {errors.images && <span className="error-message">{errors.images}</span>}
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(index)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate('/seller/products')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}