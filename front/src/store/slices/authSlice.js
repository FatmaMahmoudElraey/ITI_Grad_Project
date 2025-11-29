import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ENDPOINTS, BASE_URL } from "../../api/constants";

// Load user (if token exists)
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(ENDPOINTS.USER_DETAILS, { withCredentials: true });
      return response.data; // User data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to load user");
    }
  }
);

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.LOGIN, credentials, { withCredentials: true });
      if (response.data?.access) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      const userResponse = await axios.get(ENDPOINTS.USER_DETAILS, { withCredentials: true });
      return { user: userResponse.data };
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : "Registration failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${BASE_URL}/api/auth/jwt/logout/`, {}, { withCredentials: true });
      delete axios.defaults.headers.common['Authorization'];
      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
      if (response.data?.access) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      return response.data;
    } catch (error) {
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(
        error.response ? error.response.data : "Token refresh failed"
      );
    }
  }
);

// Account activation
export const activateAccount = createAsyncThunk(
  "auth/activateAccount",
  async (activationData, { rejectWithValue }) => {
    try {
      // Use the correct activation endpoint
      const response = await axios.post(`${BASE_URL}/api/auth/users/activation/`, {
        uid: activationData.uid,
        token: activationData.token,
      });
      return { success: true };
    } catch (error) {
      console.error("Activation error:", error.response?.data || error.message);
      // Extract error message for better display
      let errorMessage = "Activation failed";
      if (error.response?.data) {
        // Handle different error formats
        if (typeof error.response.data === 'object') {
          // If it's an object with error details
          const errorData = error.response.data;
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else {
            // Try to extract any error message from the object
            const firstErrorKey = Object.keys(errorData)[0];
            if (firstErrorKey) {
              const firstError = errorData[firstErrorKey];
              errorMessage = Array.isArray(firstError)
                ? firstError.join(', ')
                : String(firstError);
            }
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      await axios.post(`${ENDPOINTS.REGISTER}reset_password/`, { email });
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Password reset request failed"
      );
    }
  }
);

export const resetPasswordConfirm = createAsyncThunk(
  "auth/resetPasswordConfirm",
  async (resetData, { rejectWithValue }) => {
    try {
      await axios.post(`${ENDPOINTS.REGISTER}reset_password_confirm/`, resetData);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Password reset confirmation failed"
      );
    }
  }
);

// NOTE: handle payment state restoration after payment
export const restoreAuthState = async (dispatch) => {
  // Payment flow: we still check for any saved tokens left in localStorage from older flows
  // but prefer cookie-based flow. If found, attempt to restore minimal state and then clean up.
  const savedToken = localStorage.getItem('payment_access_token');
  if (savedToken) {
    try {
      // Optionally call a backend endpoint to exchange the saved token for setting cookies
      await axios.post(`${BASE_URL}/api/auth/restore-payment-auth/`, { token: savedToken });
    } catch (err) {
      // Ignore failures here; proceed to cleanup
    }

    // Clean up localStorage regardless
    localStorage.removeItem('payment_access_token');
    localStorage.removeItem('payment_refresh_token');
    localStorage.removeItem('payment_in_progress');

    try {
      await dispatch(loadUser()).unwrap();
      return true;
    } catch (err) {
      console.error("Failed to restore auth state:", err);
      return false;
    }
  }
  return false;
};

// Initialize auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: null,
};

// axios will send cookies; no need to set Authorization header on client

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
    clearAuthState(state) {
      // Reset the entire state to initial values
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || "Failed to load user";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.success = "Login successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = "Registration successful. Please check your email for activation instructions.";
        // We don't log the user in automatically after registration
        // They need to activate their account first
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.success = "Logged out successfully";
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      })

      // Account activation
      .addCase(activateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateAccount.fulfilled, (state) => {
        state.loading = false;
        state.success = "Account activated successfully! You can now log in.";
      })
      .addCase(activateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Activation failed";
      })

      // Password reset request
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password reset email sent successfully!";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset email";
      })

      // Password reset confirmation
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password has been reset successfully!";
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Password reset failed";
      });
  },
});

export const { clearError, clearSuccess, clearAuthState } = authSlice.actions;
export default authSlice.reducer;