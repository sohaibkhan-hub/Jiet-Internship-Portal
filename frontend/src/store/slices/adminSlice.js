import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../services/adminService';

const initialState = {
  allStudentsDetails: [],
  allFacultyDetails: [],
  allStudentApplicationDetails: [],
  loading: false,
  error: null,
};

// Async thunks
export const registerStudentAsync = createAsyncThunk(
  'admin/registerStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await adminService.registerStudent(studentData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Register student failed';
      return rejectWithValue(message);
    }
  }
);

export const registerFacultyAsync = createAsyncThunk(
  'admin/registerFaculty',
  async (facultyData, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.registerFaculty(facultyData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Faculty registration failed';
      return rejectWithValue(message);
    }
  }
);

export const getAllStudentDetailsAsync = createAsyncThunk(
  'admin/getAllStudentsDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllStudentsDetails(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch students data';
      return rejectWithValue(message);
    }
  }
);

export const getAllFacultyDetailsAsync = createAsyncThunk(
  'admin/getAllFacultyDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllFacultyDetails(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch faculty data';
      return rejectWithValue(message);
    }
  }
);

export const getAllStudentApplicationDetailsAsync = createAsyncThunk(
  'admin/getAllStudentApplicationDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllStudentApplicationDetails(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch students data';
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllStudentDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStudentDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allStudentsDetails = action.payload;
        state.error = null;
      })
      .addCase(getAllStudentDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllFacultyDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFacultyDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allFacultyDetails = action.payload;
        state.error = null;
      })
      .addCase(getAllFacultyDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerStudentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStudentAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerStudentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerFacultyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerFacultyAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerFacultyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllStudentApplicationDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStudentApplicationDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allStudentApplicationDetails = action.payload;
        state.error = null;
      })
      .addCase(getAllStudentApplicationDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default adminSlice.reducer;
export const {} = adminSlice.actions;