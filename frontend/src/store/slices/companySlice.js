import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyService } from '../../services/companyService';

const initialState = {
  allCompanies: [],
  allCompaniesByBranch: [],
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
      const response = await companyService.updateCompanyDetails(companyDetails._id, companyDetails);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const updateCompanyAsync = createAsyncThunk(
  'company/updateCompany',
  async ({ companyId, companyData }, { rejectWithValue }) => {
    try {
      const response = await companyService.updateCompanyDetails(companyId, companyData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const deleteCompanyAsync = createAsyncThunk(
  'company/deleteCompany',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await companyService.deleteCompany(companyId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Delete failed';
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

export const getAllCompaniesByBranchAsync = createAsyncThunk(
  'company/getAllCompaniesByBranch',
  async (branchId, { rejectWithValue }) => {
    // Accept branchId as string, not object
    const id = typeof branchId === 'object' && branchId.branchId ? branchId.branchId : branchId;
    try {
      const response = await companyService.getAllCompaniesByBranch(id); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch companies by branch';
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
      .addCase(updateCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updated = action.payload?.data;
        if (updated?._id) {
          state.allCompanies = state.allCompanies.map((c) =>
            c._id === updated._id ? updated : c
          );
          state.allCompaniesByBranch = state.allCompaniesByBranch.map((c) =>
            c._id === updated._id ? updated : c
          );
        }
      })
      .addCase(updateCompanyAsync.rejected, (state, action) => {
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
      .addCase(getAllCompaniesByBranchAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCompaniesByBranchAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allCompaniesByBranch = action.payload;
        state.error = null;
      })
      .addCase(getAllCompaniesByBranchAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompanyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const deleted = action.payload?.data;
        if (deleted?._id) {
          state.allCompanies = state.allCompanies.filter((c) => c._id !== deleted._id);
          state.allCompaniesByBranch = state.allCompaniesByBranch.filter((c) => c._id !== deleted._id);
        }
      })
      .addCase(deleteCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default companySlice.reducer;
export const {} = companySlice.actions;
