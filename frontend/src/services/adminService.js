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

  async allocateCompany(studentId)  {
    const response = await api.post('/admins/allocate-company', { studentId });
    return response.data;
  },

  async rejectApplication(studentId, reason)  {
    const response = await api.post('/admins/reject-application', { studentId, reason });
    return response.data;
  },

  async updateAllocatedCompany(studentId, companyId)  {
    console.log("cccC", studentId, companyId);
    
    const response = await api.post('/admins/update-allocated-company', { studentId, companyId });
    return response.data;
  },
};
