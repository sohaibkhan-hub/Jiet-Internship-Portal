import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { branchDomainService } from '../../services/branchDomainService';
import { companyService } from '../../services/companyService';

const initialState = {
  allCompanies: [],
  loading: false,
  error: null,
};

// Async thunks

export const addCompanyAsync = createAsyncThunk(
  'company/addCompany',
  async (companyDetails, { rejectWithValue }) => {
    try {
      const response = await companyService.addCompany(companyDetails);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const updateCompanyDetailsDomainAsync = createAsyncThunk(
  'company/updateCompanyDetailsDomain',
  async (companyDetails, { rejectWithValue }) => {
    try {
      const response = await companyService.updateCompanyDetails(companyDetails);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const getAllCompaniesAsync = createAsyncThunk(
  'company/getAllCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyService.getAllCompanies(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch companies';
      return rejectWithValue(message);
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompanyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.domain = action.payload;
        state.error = null;
      })
      .addCase(addCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCompanyDetailsDomainAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyDetailsDomainAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateCompanyDetailsDomainAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllCompaniesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCompaniesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allCompanies = action.payload;
        state.error = null;
      })
      .addCase(getAllCompaniesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default companySlice.reducer;
export const {} = companySlice.actions;