import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ENDPOINTS } from "../../api/constants";

// Load user (if token exists)
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return thunkAPI.rejectWithValue("No token found");

      const response = await axios.get(ENDPOINTS.USER_DETAILS, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const response = await axios.post(ENDPOINTS.LOGIN, credentials);
      // Store tokens in local storage
      sessionStorage.setItem("accessToken", response.data.access);
      sessionStorage.setItem("refreshToken", response.data.refresh);

      // Set default authorization header for all future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      // Fetch user data
      const userResponse = await axios.get(ENDPOINTS.USER_DETAILS);
      return { tokens: response.data, user: userResponse.data };
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
      // Clear tokens from local storage
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];

      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) {
      return rejectWithValue("No refresh token available");
    }

    try {
      const response = await axios.post(ENDPOINTS.REFRESH_TOKEN, {
        refresh: refreshToken,
      });
      sessionStorage.setItem("accessToken", response.data.access);

      // Update authorization header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;

      return response.data;
    } catch (error) {
      // If refresh token is invalid, log the user out
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      delete axios.defaults.headers.common["Authorization"];

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
      // Assuming you have an activation endpoint
      const response = await axios.post(`${ENDPOINTS.REGISTER}activate/`, {
        uid: activationData.uid,
        token: activationData.token,
      });
      return { success: true };
    } catch (error) {
      console.error("Activation error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Activation failed");
    }
  }
);

// Request password reset
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

// Confirm password reset
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

// Initialize auth state
const initialState = {
  user: null,
  isAuthenticated: !!sessionStorage.getItem("accessToken"),
  loading: false,
  error: null,
  success: null,
};

// Setup axios with stored token if it exists
const token = sessionStorage.getItem("accessToken");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

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