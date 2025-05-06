import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.PRODUCTS);
      // Filter products to only include approved ones for public display
      const approvedProducts = response.data.filter(product => product.is_approved === true);
      return approvedProducts;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch products'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchOne',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ENDPOINTS.PRODUCTS}${productId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch product'
      );
    }
  }
);

export const fetchLatestProducts = createAsyncThunk(
  'products/fetchLatest',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.LATEST_PRODUCTS);
      // Filter to only include approved products for public display
      const approvedProducts = response.data.filter(product => product.is_approved === true);
      return approvedProducts;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch latest products'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.FEATURED_PRODUCTS);
      // Filter to only include approved products for public display
      const approvedProducts = response.data.filter(product => product.is_approved === true);
      return approvedProducts;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch featured products'
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch categories'
      );
    }
  }
);

export const fetchTags = createAsyncThunk(
  'products/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.TAGS);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch tags'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.PRODUCTS, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not create product'
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${ENDPOINTS.PRODUCTS}${productId}/`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not update product'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${ENDPOINTS.PRODUCTS}${productId}/`);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not delete product'
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      // Ensure we have a valid product ID
      if (!productId) {
        return rejectWithValue('Product ID is required');
      }

      console.log('Creating review with product ID:', productId);
      
      // Create the review data object with the product ID
      const reviewPayload = {
        product: productId,
        ...reviewData
      };
      
      // Remove any duplicate product field if it exists in reviewData
      if (reviewData.product) {
        delete reviewPayload.product;
        reviewPayload.product = productId;
      }
      
      console.log('Review payload:', reviewPayload);
      
      const response = await axios.post(ENDPOINTS.PRODUCT_REVIEWS, reviewPayload);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error.response?.data || error.message);
      return rejectWithValue(
        error.response ? error.response.data : 'Could not create review'
      );
    }
  }
);

// New async thunk for searching products
export const searchProducts = createAsyncThunk(
  'products/search',
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(searchQuery)}`);
      // Filter products to only include approved ones for public display
      const approvedProducts = response.data.filter(product => product.is_approved === true);
      return approvedProducts;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not search products'
      );
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    latestItems: [],
    featuredItems: [],
    currentProduct: null,
    categories: [],
    tags: [],
    // Add search state
    searchResults: [],
    searchLoading: false,
    searchError: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearProductsState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      })
      
      // Fetch Single Product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product';
      })
      
      // Fetch Latest Products
      .addCase(fetchLatestProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLatestProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.latestItems = action.payload;
      })
      .addCase(fetchLatestProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch latest products';
      })

      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredItems = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch featured products';
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })
      
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch tags';
      })
      
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.success = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create product';
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.success = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update product';
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null;
        }
        state.success = 'Product deleted successfully';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete product';
      })

      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.searchResults = []; // Clear previous results
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload || 'Failed to search products';
      })

      // Create Product Review
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentProduct && action.payload.product === state.currentProduct.id) {
          if (!state.currentProduct.reviews) {
            state.currentProduct.reviews = [];
          }
          state.currentProduct.reviews.push(action.payload);
        }
        state.success = 'Review added successfully';
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create review';
      });
  },
});

export const { clearError, clearSuccess, clearProductsState } = productsSlice.actions;

// Add a new selector to get products by category
export const selectProductsByCategory = (state, categoryName) => {
  return state.products.items.filter(
    product => product.category_name?.toLowerCase() === categoryName?.toLowerCase()
  );
};

export default productsSlice.reducer;