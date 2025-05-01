import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" }); // Adjusted base URL

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Authentication APIs
export const loginUser = (data) => API.post("/auth/login", data);
export const requestRegister = (data) => API.post("/auth/request-registration", data);

// Student APIs
export const getStudents = () => API.get("/students");
export const getStudentById = (id) => API.get(`/students/${id}`);
export const addStudent = (studentData) => API.post("/students", studentData);

// LOR APIs
export const getLORs = () => API.get("/lors");

// New: Approve or Reject Registration
export const approveUser = (email) => API.get(`/approve-user?email=${encodeURIComponent(email)}`);
export const rejectUser = (email) => API.get(`/reject-user?email=${encodeURIComponent(email)}`);

// Add these exports to your existing api.js file

// Internship APIs
// Update your getInternships function to include population of studentId
export const getInternships = () => API.get("/internships");
export const getStudentInternships = (studentId) => API.get(`/internships/student/${studentId}`);
export const addInternship = (internshipData) => API.post("/internships", internshipData);
export const updateInternship = (id, internshipData) => API.put(`/internships/${id}`, internshipData);

// Add these functions to your api.js file
export const getPlacements = () => API.get("/placements");
export const getPlacementStatistics = () => API.get("/placements/statistics");

// Add these two functions to your api.js file

// Get all students (used in dropdown selection)
export const getAllStudents = () => API.get("/students"); 

// Add a new placement record
export const addPlacement = (data) => {
  // Use FormData to handle file uploads
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  return API.post("/placements", data, config);
};