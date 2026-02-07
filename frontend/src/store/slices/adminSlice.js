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

export const updateFacultyAsync = createAsyncThunk(
  'admin/updateFaculty',
  async ({ facultyId, facultyData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateFaculty(facultyId, facultyData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Update faculty failed';
      return rejectWithValue(message);
    }
  }
);

export const deleteFacultyAsync = createAsyncThunk(
  'admin/deleteFaculty',
  async (facultyId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteFaculty(facultyId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Delete faculty failed';
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

export const getStudentDetailsAsync = createAsyncThunk(
  'admin/getStudentDetails',
  async (email, { rejectWithValue }) => {
    try {
      const response = await adminService.getStudentDetails(email); 
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Failed to fetch students data';
      return rejectWithValue(message);
    }
  }
);

export const updateStudentAsync = createAsyncThunk(
  'admin/updateStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await adminService.updateStudent(studentData);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Register student failed';
      return rejectWithValue(message);
    }
  }
);

export const deleteStudentAsync = createAsyncThunk(
  'admin/deleteStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteStudent(studentId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Delete student failed';
      return rejectWithValue(message);
    }
  }
);

export const allocateCompanyAsync = createAsyncThunk(
  'admin/allocateCompany',
  async ({ studentId, companyId }, { rejectWithValue }) => {
    try {
      const response = await adminService.allocateCompany(studentId, companyId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Allocate company failed';
      return rejectWithValue(message);
    }
  }
);

export const rejectApplicationAsync = createAsyncThunk(
  'admin/rejectApplication',
  async ({ studentId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.rejectApplication(studentId, reason);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Reject application failed';
      return rejectWithValue(message);
    }
  }
);

export const updateAllocatedCompanyAsync = createAsyncThunk(
  'admin/updateAllocatedCompany',
  async ({ studentId, companyId }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateAllocatedCompany(studentId, companyId);
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Reject application failed';
      return rejectWithValue(message);
    }
  }
);

export const resetStudentChoicesAsync = createAsyncThunk(
  'admin/resetStudentChoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.resetStudentChoices();
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Reset student choices failed';
      return rejectWithValue(message);
    }
  }
);

export const fullResetStudentsAsync = createAsyncThunk(
  'admin/fullResetStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.fullResetStudents();
      return response;
    } catch (error) {
      const message = error?.response?.data || 'Full reset failed';
      return rejectWithValue(message);
    }
  }
);

export const downloadCompanyStudentsAsync = createAsyncThunk(
  'admin/downloadCompanyStudents',
  async ({ companyId, type }, { rejectWithValue }) => {
    try {
      const response = await adminService.downloadCompanyStudents(companyId, type);
      return response;
    } catch (error) {      
      let message = 'Download failed';
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          try {
            const json = JSON.parse(text);
            message = json?.message || message;
          } catch {
            message = text || message;
          }
        } catch {
          message = message;
        }
      } else if (typeof data === 'string') {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }
      return rejectWithValue(message);
    }
  }
);

export const downloadAllCompanyStudentsAsync = createAsyncThunk(
  'admin/downloadAllCompanyStudents',
  async ({ type }, { rejectWithValue }) => {
    try {
      const response = await adminService.downloadAllCompanyStudents(type);
      return response;
    } catch (error) {
      let message = 'Download failed';
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          try {
            const json = JSON.parse(text);
            message = json?.message || message;
          } catch {
            message = text || message;
          }
        } catch {
          message = message;
        }
      } else if (typeof data === 'string') {
        message = data;
      } else if (data?.message) {
        message = data.message;
      }
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
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
      .addCase(updateFacultyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacultyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updated = action.payload?.data;
        if (updated?._id) {
          state.allFacultyDetails = state.allFacultyDetails.map((f) =>
            f._id === updated._id ? updated : f
          );
        }
      })
      .addCase(updateFacultyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteFacultyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFacultyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const deleted = action.payload?.data;
        if (deleted?._id) {
          state.allFacultyDetails = state.allFacultyDetails.filter((f) => f._id !== deleted._id);
        }
      })
      .addCase(deleteFacultyAsync.rejected, (state, action) => {
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
      .addCase(updateStudentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateStudentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteStudentAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const deleted = action.payload?.data;
        if (deleted?._id) {
          state.allStudentsDetails = state.allStudentsDetails.filter((s) => s._id !== deleted._id);
          state.allStudentApplicationDetails = state.allStudentApplicationDetails.filter((s) => s._id !== deleted._id);
        }
      })
      .addCase(deleteStudentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getStudentDetailsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentDetailsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getStudentDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(allocateCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(allocateCompanyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(allocateCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(rejectApplicationAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectApplicationAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(rejectApplicationAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAllocatedCompanyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAllocatedCompanyAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateAllocatedCompanyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetStudentChoicesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetStudentChoicesAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetStudentChoicesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fullResetStudentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fullResetStudentsAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(fullResetStudentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(downloadCompanyStudentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadCompanyStudentsAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(downloadCompanyStudentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(downloadAllCompanyStudentsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadAllCompanyStudentsAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(downloadAllCompanyStudentsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default adminSlice.reducer;
export const { setAdminLoading } = adminSlice.actions;
