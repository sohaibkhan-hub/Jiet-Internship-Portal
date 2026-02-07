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

const sortDomainsByName = (domains) =>
  [...domains].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
const sortBranchesByName = (branches) =>
  [...branches].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

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

export const createBranchAsync = createAsyncThunk(
  'branchDomain/createBranch',
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.createBranch(branchData);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create branch';
      return rejectWithValue(message);
    }
  }
);

export const updateBranchAsync = createAsyncThunk(
  'branchDomain/updateBranch',
  async ({ branchId, branchData }, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.updateBranch(branchId, branchData);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update branch';
      return rejectWithValue(message);
    }
  }
);

export const deleteBranchAsync = createAsyncThunk(
  'branchDomain/deleteBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.deleteBranch(branchId);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete branch';
      return rejectWithValue(message);
    }
  }
);

export const createDomainAsync = createAsyncThunk(
  'branchDomain/createDomain',
  async (domainData, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.createDomain(domainData);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create domain';
      return rejectWithValue(message);
    }
  }
);

export const updateDomainAsync = createAsyncThunk(
  'branchDomain/updateDomain',
  async ({ domainId, domainData }, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.updateDomain(domainId, domainData);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update domain';
      return rejectWithValue(message);
    }
  }
);

export const deleteDomainAsync = createAsyncThunk(
  'branchDomain/deleteDomain',
  async (domainId, { rejectWithValue }) => {
    try {
      const response = await branchDomainService.deleteDomain(domainId);
      return response;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete domain';
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
        state.allDomains = sortDomainsByName(action.payload);
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
        state.allBranches = sortBranchesByName(action.payload);
        state.error = null;
      })
      .addCase(getAllBranchesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBranchAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranchAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allBranches = sortBranchesByName([action.payload, ...state.allBranches]);
      })
      .addCase(createBranchAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBranchAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranchAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allBranches = sortBranchesByName(
          state.allBranches.map((b) =>
            b._id === action.payload._id ? action.payload : b
          )
        );
      })
      .addCase(updateBranchAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBranchAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranchAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allBranches = state.allBranches.filter((b) => b._id !== action.payload._id);
      })
      .addCase(deleteBranchAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDomainAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDomainAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allDomains = sortDomainsByName([action.payload, ...state.allDomains]);
      })
      .addCase(createDomainAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDomainAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDomainAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allDomains = sortDomainsByName(
          state.allDomains.map((d) =>
            d._id === action.payload._id ? action.payload : d
          )
        );
      })
      .addCase(updateDomainAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteDomainAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDomainAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allDomains = state.allDomains.filter((d) => d._id !== action.payload._id);
      })
      .addCase(deleteDomainAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchDomainSlice.reducer;
export const {} = branchDomainSlice.actions;
