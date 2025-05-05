import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all orders for the seller
export const fetchSellerOrders = createAsyncThunk(
  'sellerOrders/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the current user from state
      const { auth } = getState();
      const sellerId = auth.user?.id;
      
      if (!sellerId) {
        return rejectWithValue('User ID not found. Please log in again.');
      }
      
      console.log('Fetching seller orders for seller ID:', sellerId);
      
      // Fetch all orders directly
      const ordersResponse = await axios.get(ENDPOINTS.ORDERS, {
        headers: getAuthHeader()
      });
      
      console.log('All orders from API:', ordersResponse.data);
      
      // Return the raw orders data
      return ordersResponse.data || [];
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? 'Could not fetch seller orders' 
          : error.response?.data || 'Could not fetch seller orders'
      );
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'sellerOrders/updateStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${ENDPOINTS.ORDERS}${orderId}/`, 
        { payment_status: status }, 
        { headers: getAuthHeader() }
      );
      
      return { id: orderId, payment_status: status, updatedOrder: response.data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return rejectWithValue(
        typeof error.response?.data === 'object' 
          ? 'Could not update order status' 
          : error.response?.data || 'Could not update order status'
      );
    }
  }
);

const sellerOrdersSlice = createSlice({
  name: 'sellerOrders',
  initialState: {
    items: [],
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
    clearSellerOrdersState: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch seller orders';
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].payment_status = action.payload.payment_status;
        }
        state.success = 'Order status updated successfully';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update order status';
      });
  },
});

export const { clearError, clearSuccess, clearSellerOrdersState } = sellerOrdersSlice.actions;

export default sellerOrdersSlice.reducer;
