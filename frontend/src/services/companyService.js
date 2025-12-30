import api from '../utils/baseApi';

export const companyService = {

  async addCompany(data)  {
    const response = await api.post('/companies/add-company', data);
    return response.data; // Extract data from ApiResponse wrapper
  },

  async getAllCompanies() {
    const response = await api.get('/companies/all-companies');
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getAllCompaniesByBranch(branchId) {
    const response = await api.get(`/companies/all-companies-with-branch/${branchId}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async updateCompanyDetails(data)  {
    const response = await api.post('/companies/update-company', data);
    return response.data.data;
  },
};
