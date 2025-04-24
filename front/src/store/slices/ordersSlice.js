import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

export const fetchCart = createAsyncThunk(
  'orders/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.CART);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch cart'
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ENDPOINTS.ORDERS);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not fetch orders'
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'orders/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.CART_ITEMS, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not add item to cart'
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'orders/updateCartItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${ENDPOINTS.CART_ITEMS}${id}/`, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not update cart item'
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'orders/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await axios.delete(`${ENDPOINTS.CART_ITEMS}${itemId}/`);
      return itemId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not remove item from cart'
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.ORDERS, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : 'Could not create order'
      );
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    cart: {
      items: [],
      total: 0,
    },
    orders: [],
    subscriptions: [],
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
    clearOrdersState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch cart';
      })
      
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart.items.push(action.payload);
        state.cart.total = state.cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.success = 'Item added to cart successfully';
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add item to cart';
      })
      
      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cart.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.cart.items[index] = action.payload;
        }
        state.cart.total = state.cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.success = 'Cart item updated successfully';
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update cart item';
      })
      
      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart.items = state.cart.items.filter(item => item.id !== action.payload);
        state.cart.total = state.cart.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        state.success = 'Item removed from cart successfully';
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove item from cart';
      })
      
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.success = 'Order created successfully';
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create order';
      });
  },
});

export const { clearError, clearSuccess, clearOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;