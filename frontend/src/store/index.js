import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import branchDomainReducer from './slices/branchDomainSlice';
import companyReducer from './slices/companySlice';
import adminReducer from './slices/adminSlice';
import studentReducer from './slices/studentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    domainBranch: branchDomainReducer,
    company: companyReducer,
    admin: adminReducer,
    student: studentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
