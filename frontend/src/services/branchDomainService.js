import api from '../utils/baseApi';

export const branchDomainService = {
  async login(email, password) {
    const response = await api.post('/users/login', { email, password });
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getDomainByBranchId(branchId) {
    const response = await api.get(`/branch-domain/domains-branchId/${branchId}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async updateStudentDomain(domainData)  {
    const response = await api.put('/students/update-domain', domainData);
    return response.data; // Extract data from ApiResponse wrapper
  },

  async getAllDomains() {
    const response = await api.get('/branch-domain/all-domains');
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getAllBranches() {
    const response = await api.get('/branch-domain/branches');
    return response.data.data; // Extract data from ApiResponse wrapper
  }
};
