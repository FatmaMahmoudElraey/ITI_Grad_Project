import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constants';

// Axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

const initialState = {
  userDetails: null,
  userProfile: null,
  purchasedProducts: [],
  userFavorites: [],
  loading: false,
  error: null,
  success: null,
};

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks for user operations
export const fetchUserDetails = createAsyncThunk(
  'users/fetchDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${ENDPOINTS.USER_DETAILS}${userId}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

export const fetchUserFavorites = createAsyncThunk(
  'users/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.FAVORITES);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user favorites');
    }
  }
);
export const fetchUserProfile = createAsyncThunk(
  'users/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (key === 'picture' && profileData[key] instanceof File) {
          formData.append('picture', profileData[key]);
        } else {
          formData.append(key, profileData[key]);
        }
      });

      const response = await api.patch(ENDPOINTS.USER_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);


export const deleteUserAccount = createAsyncThunk(
  'users/deleteAccount',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`${ENDPOINTS.USER_DETAILS}${userId}/`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
    }
  }
);

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = null;
    },
    resetUserState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle fetchUserFavorites
      .addCase(fetchUserFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.loading = false;
        // Save the favorites somewhere in the state
        state.userFavorites = action.payload;
        state.success = 'Favorites fetched successfully';
      })
      .addCase(fetchUserFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        state.purchasedProducts = action.payload.orders?.map(order => ({
          id: order.id,
          title: order.items[0]?.product?.title,
          image: order.items[0]?.product?.preview_image,
          author: order.items[0]?.product?.seller?.name,
          category: order.items[0]?.product?.category?.name,
          purchaseDate: order.created_at,
          price: order.total_amount,
          downloads: order.downloads || 0,
          rating: order.items[0]?.product?.average_rating || 0
        })) || [];
        state.success = 'Profile fetched successfully';
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchUserDetails
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
        state.success = 'User details fetched successfully';
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
        state.success = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle deleteUserAccount
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        return {
          ...initialState,
          success: 'Account deleted successfully'
        };
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserSuccess, resetUserState } = usersSlice.actions;
export default usersSlice.reducer;