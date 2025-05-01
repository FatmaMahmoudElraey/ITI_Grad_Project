import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.PRODUCTS);
      return response.data;
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
      return response.data;
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
      return response.data;
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
      const response = await axios.post(ENDPOINTS.PRODUCT_REVIEWS, {
        product: productId,
        ...reviewData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not create review'
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
export default productsSlice.reducer;