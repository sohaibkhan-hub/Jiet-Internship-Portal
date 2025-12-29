import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

const initialState = {
  user: null,
  isAuthenticated: false, // Don't set this based on localStorage alone
  role: null,
  loading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('accessToken', response.accessToken);
      
      // Dispatch getCurrentUserAsync to update the Redux state
      await dispatch(getCurrentUserAsync());
      toast.success('Login successful!');
      return response.user;
    } catch (error) {
      const message = error?.response?.data || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('accessToken', response.accessToken);
      // Dispatch getCurrentUserAsync to update the Redux state
      await dispatch(getCurrentUserAsync());
      toast.success('Registration successful!');
      return response.user;
    } catch (error) {
      const message = error?.response?.data || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser(); 
      return user;
    } catch (error) {
      localStorage.removeItem('accessToken');
      const message = error?.response?.data || 'Session expired';
      return rejectWithValue(message);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    const user = await authService.logout(); 
 
    if(user.success === true || user.statusCode === 200) {
      localStorage.removeItem('accessToken');
      await dispatch(getCurrentUserAsync());
      toast.success(user.message || 'Logged out successfully');
      return null;
    } else {
      toast.error('Logout failed');
    }
  }
);

export const changePasswordAsync = createAsyncThunk(
  'auth/changePassword',
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(formData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Change password failed';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.role = null;
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        localStorage.removeItem('accessToken');
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;
      });

      // Change Password
      builder
      .addCase(changePasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
