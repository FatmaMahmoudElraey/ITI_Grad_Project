import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../assets/css/dashboard/dash.css';

export default function ProductForm({ 
  productData, 
  errors, 
  categories,
  handleChange, 
  handleImageChange, 
  removeImage,
  handleSubmit, 
  isSubmitting,
  submitButtonText = "Submit"
}) {
  const [description, setDescription] = useState(productData.description);

  const handleDescriptionChange = (value) => {
    setDescription(value);
    handleChange({ target: { name: 'description', value } });
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-group">
        <label htmlFor="name">Product Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={productData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <p className="error-message">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label>Product Description</label>
        <ReactQuill
          value={description}
          onChange={handleDescriptionChange}
          modules={{
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link', 'image'],
              ['clean']
            ]
          }}
        />
        {errors.description && <p className="error-message">{errors.description}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={productData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <p className="error-message">{errors.price}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={productData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="error-message">{errors.category}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="stock">Stock Quantity</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={productData.stock}
            onChange={handleChange}
            min="0"
            className={errors.stock ? 'error' : ''}
          />
          {errors.stock && <p className="error-message">{errors.stock}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="sku">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Product Images</label>
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
        />
        {errors.images && <p className="error-message">{errors.images}</p>}
        
        <div className="image-previews">
          {productData.imagePreviews?.map((preview, index) => (
            <div key={index} className="image-preview">
              <img src={preview} alt={`Preview ${index}`} />
              <button 
                type="button" 
                onClick={() => removeImage(index)}
                className="remove-image-button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Product Variants</label>
        {/* Variant management UI would go here */}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="submit-button"
      >
        {isSubmitting ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          submitButtonText
        )}
      </button>
    </form>
  );
}

ProductForm.propTypes = {
  productData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  categories: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  removeImage: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  submitButtonText: PropTypes.string
};