import api from '../utils/baseApi';

export const authService = {
  async login(email, password) {
    const response = await api.post('/users/login', { email, password });
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async logout() {
    const response = await api.post('/users/logout');
    
    return response.data; // Extract data from ApiResponse wrapper
  },

  async changePassword(formData) {
    const response = await api.post('/users/change-password', formData);   
        return response.data; // Extract data from ApiResponse wrapper
  },
};
