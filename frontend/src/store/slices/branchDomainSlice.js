import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { branchDomainService } from '../../services/branchDomainService';

const initialState = {
  domain: [],
  branch: null,
  allDomains: [],
  allBranches: [],
  loading: false,
  error: null,
};

// Async thunks

export const getDomainByBranchIdAsync = createAsyncThunk(
  'branchDomain/getDomainByBranchId',
  async ({ branchId }, { rejectWithValue }) => {
    try {

      const response = await branchDomainService.getDomainByBranchId(branchId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch domains';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateStudentDomainAsync = createAsyncThunk(
  'branchDomain/updateStudentDomain',
  async (domains, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.updateStudentDomain(domains);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update failed';
      return rejectWithValue(message);
    }
  }
);

export const getAllDomainsAsync = createAsyncThunk(
  'branchDomain/getAllDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.getAllDomains(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch domains';
      return rejectWithValue(message);
    }
  }
);

export const getAllBranchesAsync = createAsyncThunk(
  'branchDomain/getAllBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.getAllBranches(); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch branches';
      return rejectWithValue(message);
    }
  }
);


const branchDomainSlice = createSlice({
  name: 'branchDomain',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDomainByBranchIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDomainByBranchIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.domain = action.payload;
        state.error = null;
      })
      .addCase(getDomainByBranchIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudentDomainAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentDomainAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateStudentDomainAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllDomainsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDomainsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allDomains = action.payload;
        state.error = null;
      })
      .addCase(getAllDomainsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllBranchesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBranchesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allBranches = action.payload;
        state.error = null;
      })
      .addCase(getAllBranchesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchDomainSlice.reducer;
export const {} = branchDomainSlice.actions;
