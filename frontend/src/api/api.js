import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create API instance with base configuration
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Add request interceptor to include auth token in all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  console.error("Request preparation error:", error);
  return Promise.reject(error);
});

// Add response interceptor to handle common errors
API.interceptors.response.use(
  response => response,
  error => {
    // Handle network errors more gracefully
    if (error.message === 'Network Error') {
      console.error('Network error - server may be down or unreachable');
      // You can dispatch a notification here if you have a notification system
    }
    
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data.message || 'Unauthorized');
      
      // Only redirect if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optionally redirect to login
        // window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const loginUser = (data) => API.post("/auth/login", data);
export const requestRegister = (data) => API.post("/auth/request-registration", data);
export const approveUser = (email) => API.get(`/approve-user?email=${encodeURIComponent(email)}`);
export const rejectUser = (email) => API.get(`/reject-user?email=${encodeURIComponent(email)}`);

// Student APIs
export const getStudents = () => API.get("/students");
export const getStudentById = (id) => API.get(`/students/${id}`);
export const addStudent = (studentData) => API.post("/students", studentData);
export const getAllStudents = () => API.get("/students");

// LOR APIs
export const getLORs = () => API.get("/lors");
export const getLORById = (id) => API.get(`/lors/${id}`);
export const generateLOR = (lorId, data) => API.post(`/lors/${lorId}/generate`, data);
export const createLORPdf = (lorId) => API.post(`/lors/${lorId}/create-pdf`);

// AI LOR API functions
export const getLORRecommendations = (studentId) => API.get(`/ai-lors/recommendations/${studentId}`);
export const generateSmartLOR = (data) => API.post('/ai-lors/generate', data);

// LOR Template APIs
export const getAllTemplates = () => API.get('/lor-templates');
export const createTemplate = (data) => API.post('/lor-templates', data);
export const updateTemplate = (id, data) => API.put(`/lor-templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/lor-templates/${id}`);

// Internship APIs
export const getInternships = () => API.get("/internships");
export const getStudentInternships = (studentId) => API.get(`/internships/student/${studentId}`);
export const addInternship = (internshipData) => API.post("/internships", internshipData);
export const updateInternship = (id, internshipData) => API.put(`/internships/${id}`, internshipData);

// Placement APIs
export const getPlacements = () => API.get("/placements");
export const getPlacementStatistics = () => API.get("/placements/statistics");
export const addPlacement = (data) => {
  // Use FormData to handle file uploads
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  return API.post("/placements", data, config);
};

// Export the API instance for other uses
export default API;