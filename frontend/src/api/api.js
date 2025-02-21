import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const loginUser = (data) => API.post("/api/auth/login", data);
export const getStudents = () => API.get("/api/students");
export const getStudentById = (id) => API.get(`/api/students/${id}`);
export const getLORs = () => API.get("/api/lors");

