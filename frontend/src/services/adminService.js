import api from '../utils/baseApi';

export const adminService = {

  async addCompany(data)  {
    const response = await api.post('/companies/add-company', data);
    return response.data; // Extract data from ApiResponse wrapper
  },

  async registerStudent(data)  {
    const response = await api.post('/admins/register-student', data);
    return response.data;
  },

  async registerFaculty(data)  {
    const response = await api.post('/admins/register-faculty', data);
    return response.data; // Extract data from ApiResponse wrapper
  },

  async updateFaculty(facultyId, data) {
    const response = await api.put(`/admins/faculties/${facultyId}`, data);
    return response.data;
  },

  async deleteFaculty(facultyId) {
    const response = await api.delete(`/admins/faculties/${facultyId}`);
    return response.data;
  },

  async getAllStudentsDetails() {
    const response = await api.get('/admins/all-students');
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getAllStudentApplicationDetails() {
    const response = await api.get('/admins/all-student-applications');
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async getAllFacultyDetails() {
    const response = await api.get('/admins/all-faculties');
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async updateStudentDetails(data)  {
    const response = await api.post('/students/update-student', data);
    return response.data.data;
  },

  async getStudentDetails(email) {
    const response = await api.get(`/admins/student-details/${email}`);
    
    return response.data.data; // Extract data from ApiResponse wrapper
  },

  async updateStudent(data)  {
    const response = await api.post('/admins/update-student', data);
    return response.data;
  },

  async deleteStudent(studentId) {
    const response = await api.delete(`/admins/students/${studentId}`);
    return response.data;
  },

  async allocateCompany(studentId, companyId)  {
    const response = await api.post('/admins/allocate-company', { studentId, companyId });
    return response.data;
  },

  async rejectApplication(studentId, reason)  {
    const response = await api.post('/admins/reject-application', { studentId, reason });
    return response.data;
  },

  async updateAllocatedCompany(studentId, companyId)  {    
    const response = await api.post('/admins/update-allocated-company', { studentId, companyId });
    return response.data;
  },

  async resetStudentChoices() {
    const response = await api.post('/admins/reset-student-choices');
    return response.data;
  },

  async fullResetStudents() {
    const response = await api.post('/admins/full-reset-students');
    return response.data;
  },

  async downloadStudentTempPasswords() {
    const response = await api.get('/admins/download-student-temp-passwords', {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadCompanyStudents(companyId, type) {
    const response = await api.post(
      '/admins/download-company-students',
      { companyId, type },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async downloadAllCompanyStudents(type) {
    const response = await api.get('/admins/download-all-company-students', {
      params: { type },
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadTrainingLetterForStudent(studentId) {
    const response = await api.get(`/admins/training-letter/${studentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getFeatureFlags() {
    const response = await api.get('/admins/feature-flags');
    return response.data.data;
  },

  async updateFeatureFlags(data) {
    const response = await api.put('/admins/feature-flags', data);
    return response.data.data;
  },

  async bulkRegisterStudents(formData) {
    const response = await api.post('/admins/bulk-register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
    });
    return response.data;
  },
};
