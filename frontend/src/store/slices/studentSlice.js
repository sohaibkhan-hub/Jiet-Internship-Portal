import { createSlice, createAsyncThunk, isPending, isFulfilled, isRejected } from '@reduxjs/toolkit';
import { studentService } from '../../services/studentService';

const initialState = {
  domainCompanies: [],
  loading: false,
  error: null,
};

// Async thunks

export const submitInternshipApplicationAsync = createAsyncThunk(
  'student/submitInternshipApplication',
  async (choicesData, { rejectWithValue }) => {
    try {
      const response = await studentService.submitInternshipApplication(choicesData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed to submit internship application';
      return rejectWithValue(message);
    }
  }
);

export const getDomainCompaniesAsync = createAsyncThunk(
  'student/getDomainCompanies',
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await studentService.getDomainCompanies(domainId); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch companies';
      return rejectWithValue(message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitInternshipApplicationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitInternshipApplicationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.domain = action.payload;
        state.error = null;
      })
      .addCase(submitInternshipApplicationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDomainCompaniesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDomainCompaniesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.domainCompanies = action.payload;
        state.error = null;
      })
      .addCase(getDomainCompaniesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isFulfilled, (state) => {
        state.loading = false;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default studentSlice.reducer;
export const { setStudentLoading } = studentSlice.actions;
