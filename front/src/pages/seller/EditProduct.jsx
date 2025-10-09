// src/pages/Seller/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Seller/Sidebar";
import { FaTag, FaFileAlt, FaVideo, FaImage, FaLink, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../../api/constants';

export default function EditProduct() {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    tags: [],
    file: null,
    fileChanged: false,
    preview_video: null,
    previewVideoChanged: false,
    photo: null,
    photoChanged: false,
    live_demo_url: ''
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Using cookie-based auth; axios will send cookies automatically (withCredentials=true)

  // Fetch product data and other necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!productId) {
          setNotification({ type: 'error', message: 'No product ID specified for editing.'});
          setIsLoading(false);
          return;
        }

        // Fetch categories
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories/`);
        setCategories(categoriesResponse.data);
        
        // Fetch tags
        const tagsResponse = await axios.get(`${BASE_URL}/api/tags/`);
        setAllTags(tagsResponse.data);
        
        // Fetch product data
        if (productId) {
          const response = await axios.get(`${BASE_URL}/api/products/${productId}/`, {
            headers: getAuthHeader()
          });
          
          const productData = response.data;

          if (!productData || Object.keys(productData).length === 0) {
            setNotification({ type: 'error', message: 'Failed to load product details. The product may not exist or data is unavailable.' });
            setIsLoading(false);
            return; 
          }
          
          let categoryId = '';
          if (productData.category) {
            if (typeof productData.category === 'object' && productData.category.id !== undefined) {
              categoryId = productData.category.id; // Category is an object {id: X, name: Y}
            } else {
              categoryId = productData.category; // Category is already an ID
            }
          } else if (productData.category_id !== undefined) {
            categoryId = productData.category_id; // Fallback to category_id if present
          }

          // Ensure tags are IDs
          const tagIds = Array.isArray(productData.tags)
            ? productData.tags.map(tag => (typeof tag === 'object' && tag.id !== undefined ? tag.id : tag))
            : [];

          // Populate form data
          setFormData({
            id: productData.id,
            title: productData.title || productData.name || '',
            description: productData.description || '',
            price: productData.price ? String(productData.price) : '',
            category: categoryId, // Use the resolved categoryId
            tags: tagIds,         // Use the resolved tagIds
            file: null, // Not loading existing files directly into file input for edit
            fileChanged: false,
            preview_video: null,
            previewVideoChanged: false,
            photo: null,
            photoChanged: false,
            live_demo_url: productData.live_demo_url || ''
          });
          
          // Set file references
          if (productData.file) {
            setCurrentFile(productData.file);
          }
          
          if (productData.photo) {
            setCurrentPhoto(productData.photo);
            // If there's a photo URL, add it to previews
            setImagePreviews([productData.photo]);
          }
          
          if (productData.preview_video) {
            setCurrentVideo(productData.preview_video);
          }
        }
      } catch (error) {
        let errorMessage = 'Failed to load product data. Please try again.';
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Product not found. It may have been deleted or the ID is incorrect.';
          } else if (error.response.status === 403 || error.response.status === 401) {
            errorMessage = 'You are not authorized to view or edit this product.';
          } else if (error.response.data && typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else {
            errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
          }
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your network connection.';
        }
        setNotification({
          type: 'error',
          message: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
        fileChanged: name === 'file',
        previewVideoChanged: name === 'preview_video',
        photoChanged: name === 'photo'
      }));
      
      // If it's a photo, create a preview
      if (name === 'photo' && files[0]) {
        setImagePreviews([URL.createObjectURL(files[0])]);
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      tags: selectedOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Only validate file if it's a new product or the file is being changed
    if (!currentFile && !formData.file) {
      newErrors.file = 'Product file is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the form errors before submitting.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      
      // For category, we need to send the ID
      if (formData.category) {
        formDataObj.append('category', formData.category);
      }
      
      // Add tags
      formData.tags.forEach(tagId => {
        formDataObj.append('tags', tagId);
      });
      
      // Only append files if they've been changed
      if (formData.fileChanged && formData.file) {
        formDataObj.append('file', formData.file);
      }
      
      if (formData.previewVideoChanged && formData.preview_video) {
        formDataObj.append('preview_video', formData.preview_video);
      }
      
      if (formData.photoChanged && formData.photo) {
        formDataObj.append('photo', formData.photo);
      }
      
      if (formData.live_demo_url) {
        formDataObj.append('live_demo_url', formData.live_demo_url);
      }
      
      
      // Make direct API call to update product
      const response = await axios.patch(
        `${BASE_URL}/api/products/${productId}/`, 
        formDataObj,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      
      navigate('/seller/products', { 
        state: { 
          message: 'Product updated successfully!',
          messageType: 'success'
        } 
      });
    } catch (error) {
      
      // Handle validation errors from server
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        
        // Create a readable error message for notification
        let errorMessage = 'Failed to update product. Please check the form for errors.';
        if (typeof error.response.data === 'object') {
          const errorKeys = Object.keys(error.response.data);
          if (errorKeys.length > 0) {
            errorMessage = `Error: ${errorKeys.map(key => `${key} - ${error.response.data[key]}`).join(', ')}`;
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        
        setNotification({
          type: 'error',
          message: errorMessage
        });
      } else {
        setErrors({
          submit: 'Failed to update product. Please try again.'
        });
        
        setNotification({
          type: 'error',
          message: 'Failed to update product. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <h1 className="dashboard-header">Edit Product</h1>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.type === 'error' && <FaExclamationTriangle className="notification-icon" />}
            {notification.message}
            <button 
              className="close-notification" 
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>
        )}
        
        <div className="form-card">
          {errors.fetch && (
            <div className="alert error">
              {errors.fetch}
            </div>
          )}
          {errors.submit && (
            <div className="alert error">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="product-form p-4" style={{boxShadow:"0 10px 30px rgba(0, 0, 0, 0.2)", maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden', width: '100%', maxWidth: '1200px', margin: '20px auto'}}>
            <div className="form-container">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="product-title">
                    <FaTag className="form-icon" /> Title *
                  </label>
                  <input
                    id="product-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`fancy-input ${errors.title ? 'invalid' : ''}`}
                    placeholder="Enter product title"
                    required
                  />
                  {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-category">
                    <FaTag className="form-icon" /> Category *
                  </label>
                  <select
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`fancy-select ${errors.category ? 'invalid' : ''}`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="product-price">
                    <FaDollarSign className="form-icon" /> Price ($) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`fancy-input ${errors.price ? 'invalid' : ''}`}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-tags">
                    <FaTag className="form-icon" /> Tags
                  </label>
                  <select
                    id="product-tags"
                    name="tags"
                    multiple
                    value={formData.tags}
                    onChange={handleTagChange}
                    className="fancy-select tag-select"
                  >
                    {allTags.map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                  <small className="form-text">Hold Ctrl (or Cmd) to select multiple tags</small>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="product-description">
                    <FaFileAlt className="form-icon" /> Description *
                  </label>
                  <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`fancy-textarea ${errors.description ? 'invalid' : ''}`}
                    rows={4}
                    maxLength={500}
                    placeholder="Product description"
                    required
                  />
                  <div className="char-count">{formData.description.length}/500</div>
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-file">
                    <FaFileAlt className="form-icon" /> Product File {!currentFile && '*'}
                  </label>
                  {currentFile && (
                    <div className="current-file-info">
                      <p>Current file: <a href={currentFile} target="_blank" rel="noopener noreferrer">View current file</a></p>
                    </div>
                  )}
                  <div className="fancy-file-input">
                    <input
                      id="product-file"
                      type="file"
                      name="file"
                      onChange={handleChange}
                      className={errors.file ? 'invalid' : ''}
                      required={!currentFile}
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.file ? formData.file.name : 'Choose new file'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  {errors.file && <span className="error-message">{errors.file}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-photo">
                    <FaImage className="form-icon" /> Product Photo
                  </label>
                  {currentPhoto && (
                    <div className="current-file-info">
                      <p>Current photo: <a href={currentPhoto} target="_blank" rel="noopener noreferrer">View current photo</a></p>
                    </div>
                  )}
                  <div className="fancy-file-input">
                    <input
                      id="product-photo"
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.photo ? formData.photo.name : 'Choose new photo'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="image-preview">
                      <img src={imagePreviews[0]} alt="Product preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-preview-video">
                    <FaVideo className="form-icon" /> Preview Video (Optional)
                  </label>
                  {currentVideo && (
                    <div className="current-file-info">
                      <p>Current video: <a href={currentVideo} target="_blank" rel="noopener noreferrer">View current video</a></p>
                    </div>
                  )}
                  <div className="fancy-file-input">
                    <input
                      id="product-preview-video"
                      type="file"
                      name="preview_video"
                      accept="video/*"
                      onChange={handleChange}
                    />
                    <div className="file-input-display">
                      <span className="file-name">{formData.preview_video ? formData.preview_video.name : 'Choose new video'}</span>
                      <button type="button" className="browse-btn">Browse</button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="product-live-demo">
                    <FaLink className="form-icon" /> Live Demo URL (Optional)
                  </label>
                  <input
                    id="product-live-demo"
                    type="url"
                    name="live_demo_url"
                    value={formData.live_demo_url}
                    onChange={handleChange}
                    className="fancy-input"
                    placeholder="https://example.com"
                  />
                </div>
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
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <style jsx="true">{`
        .fancy-card {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border: none;
          overflow: hidden;
          background: #fff;
          transition: all 0.3s ease;
        }
        
        .form-container {
          padding: 0 20px;
          margin-bottom: 15px;
        }
        
        .form-icon {
          margin-right: 8px;
          color: #4a6cf7;
        }
        
        .current-file-info {
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .current-file-info a {
          color: #4a6cf7;
          text-decoration: none;
        }
        
        .current-file-info a:hover {
          text-decoration: underline;
        }
        
        .image-preview {
          margin-top: 10px;
          border-radius: 8px;
          overflow: hidden;
          max-width: 200px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .notification {
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          position: relative;
          animation: slideIn 0.3s ease-out;
        }
        
        .notification.success {
          background-color: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }
        
        .notification.error {
          background-color: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }
        
        .notification-icon {
          margin-right: 8px;
        }
        
        .close-notification {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.7;
        }
        
        .close-notification:hover {
          opacity: 1;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .fancy-file-input {
          position: relative;
        }
        
        .fancy-file-input input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
          z-index: 2;
        }
        
        .file-input-display {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .file-name {
          flex: 1;
          padding: 12px 16px;
          background: #f9f9f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-right: 1px solid #ddd;
        }
        
        .browse-btn {
          padding: 12px 20px;
          background: #4a6cf7;
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .tag-select {
          min-height: 120px;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #4a6cf7;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}