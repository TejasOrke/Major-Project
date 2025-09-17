// Central API client and endpoint helpers
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
	timeout: 15000
});

API.interceptors.request.use(cfg => {
	const token = localStorage.getItem('token');
	if (token) cfg.headers.Authorization = `Bearer ${token}`;
	return cfg;
}, err => Promise.reject(err));

API.interceptors.response.use(r => r, err => {
	if (err.message === 'Network Error') console.error('Network error');
	if (err.response && (err.response.status === 401 || err.response.status === 403)) {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	}
	return Promise.reject(err);
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const requestRegister = (data) => API.post('/auth/request-registration', data);
export const approveUser = (email) => API.get(`/approve-user?email=${encodeURIComponent(email)}`);
export const rejectUser = (email) => API.get(`/reject-user?email=${encodeURIComponent(email)}`);

// Students
export const getStudents = () => API.get('/students');
export const getStudentById = (id) => API.get(`/students/${id}`);
export const addStudent = (studentData) => API.post('/students', studentData);
export const getAllStudents = () => API.get('/students');

// LOR base
export const getLORs = () => API.get('/lors');
export const getLORById = (id) => API.get(`/lors/${id}`);
export const generateLOR = (lorId, data) => API.post(`/lors/${lorId}/generate`, data);
export const createLORPdf = (lorId) => API.post(`/lors/${lorId}/create-pdf`);

// AI LOR
export const getLORRecommendations = (studentId) => API.get(`/lor/analyze/${studentId}`);
export const testStudentData = (studentId) => API.get(`/lor/test/${studentId}`);
export const getRecommendedTemplates = (studentId, limit = 5) => API.get(`/lor/recommended-templates/${studentId}?limit=${limit}`);
export const generateSmartLOR = (data) => API.post('/lor/generate', data);

// Templates
export const getAllTemplates = () => API.get('/lor-templates');
export const createTemplate = (data) => API.post('/lor-templates', data);
export const updateTemplate = (id, data) => API.put(`/lor-templates/${id}`, data);
export const deleteTemplate = (id) => API.delete(`/lor-templates/${id}`);

// Internships
export const getInternships = () => API.get('/internships');
export const getStudentInternships = (studentId) => API.get(`/internships/student/${studentId}`);
export const addInternship = (internshipData) => API.post('/internships', internshipData);
export const updateInternship = (id, internshipData) => API.put(`/internships/${id}`, internshipData);

// Placements
export const getPlacements = () => API.get('/placements');
export const getPlacementStatistics = () => API.get('/placements/statistics');
export const addPlacement = (data) => {
	const config = { headers: { 'Content-Type': 'multipart/form-data' } };
	return API.post('/placements', data, config);
};

export default API;
