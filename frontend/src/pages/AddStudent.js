import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addStudent } from "../api/api";


export default function AddStudent() {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    email: "",
    department: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is an admin
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    // Redirect if user is not admin
    if (!storedUser || storedUser.role !== "admin") {
      setMessage("Access denied. Admin privileges required.");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addStudent(formData);
      setMessage("Student added successfully!");
      setTimeout(() => navigate("/students"), 2000); // Redirect after success
    } catch (error) {
      console.error("Error details:", error);
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  // Don't render form if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-600 text-white p-4 rounded-lg">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p>You need administrator privileges to access this page.</p>
              <p>Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Add Student</h1>
            {message && (
              <p className={`p-3 rounded mb-4 ${message.includes('success') ? 'bg-green-600' : 'bg-red-600'}`}>
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter student name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  placeholder="Enter roll number"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
              >
                Add Student
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}