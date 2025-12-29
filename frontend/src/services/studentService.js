import api from '../utils/baseApi';

export const studentService = {

  async submitInternshipApplication(data)  {
    const response = await api.post('/students/submit-choices', data);
    return response.data; // Extract data from ApiResponse wrapper
  },

  async getDomainCompanies(domainId) {
    const response = await api.get(`/students/domain-companies/${domainId}`);
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async updateCompanyDetails(data)  {
    const response = await api.post('/companies/update-company', data);
    return response.data.data;
  },
};
