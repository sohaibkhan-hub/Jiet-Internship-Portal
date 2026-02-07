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
  },

  async createBranch(branchData) {
    const response = await api.post('/branch-domain/create-branch', branchData);
    return response.data.data;
  },

  async updateBranch(branchId, branchData) {
    const response = await api.put(`/branch-domain/branches/${branchId}`, branchData);
    return response.data.data;
  },

  async deleteBranch(branchId) {
    const response = await api.delete(`/branch-domain/branches/${branchId}`);
    return response.data.data;
  },

  async createDomain(domainData) {
    const response = await api.post('/branch-domain/create-domain', domainData);
    return response.data.data;
  },

  async updateDomain(domainId, domainData) {
    const response = await api.put(`/branch-domain/update/${domainId}`, domainData);
    return response.data.data;
  },

  async deleteDomain(domainId) {
    const response = await api.delete(`/branch-domain/delete/${domainId}`);
    return response.data.data;
  }
};
