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

// LOR APIs
export const getLORs = () => API.get("/lors");

// New: Approve or Reject Registration
export const approveUser = (email) => API.get(`/approve-user?email=${encodeURIComponent(email)}`);
export const rejectUser = (email) => API.get(`/reject-user?email=${encodeURIComponent(email)}`);
