import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addStudent } from "../api";
import AddInternship from "./AddInternship";
import AddPlacement from "./AddPlacement";

export default function AddStudent() {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    email: "",
    program: "",
    semester: "",
    cgpa: "",
    skills: "",
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [newStudentId, setNewStudentId] = useState(null);
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
      const studentId = response?.data?._id || response?._id;
      setNewStudentId(studentId);
      const isUG = [
        "B.Tech. Computer Engineering",
        "B.Tech. Electronics and Telecommunication Engineering",
        "B.Tech. Computer Science And Engineering",
      ].includes(formData.program);
      const isPG = [
        "Master of Computer Applications",
        "M.Tech. (Electronics & Telecommunication)",
        "M.Tech. (Computer Engineering)",
      ].includes(formData.program);
      const isLastSem =
        (isUG && Number(formData.semester) === 8) ||
        (isPG && Number(formData.semester) === 4);
      if (isLastSem) {
        setMessage(
          "Student added successfully! You can now add internship and placement records."
        );
      } else {
        setMessage(
          "Student added successfully! Internship and placement can only be added in the final semester."
        );
        setTimeout(() => navigate(`/student/${studentId}`), 2000);
      }
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-2xl font-bold mb-4">Add Student</h1>
            {message && (
              <p
                className={`p-3 rounded mb-4 ${
                  message.includes("success") ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {message}
              </p>
            )}
            {!newStudentId && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...existing student form fields... */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
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
                  <label className="block text-sm font-medium mb-1">
                    Roll Number
                  </label>
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
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
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
                  <label className="block text-sm font-medium mb-1">
                    Program
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <optgroup label="UG Programmes">
                      {[
                        "B.Tech. Computer Engineering",
                        "B.Tech. Electronics and Telecommunication Engineering",
                        "B.Tech. Computer Science And Engineering",
                      ].map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="PG Programmes">
                      {[
                        "Master of Computer Applications",
                        "M.Tech. (Electronics & Telecommunication)",
                        "M.Tech. (Computer Engineering)",
                      ].map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {/* Dynamically show semester options based on program */}
                    {formData.program &&
                      [
                        "B.Tech. Computer Engineering",
                        "B.Tech. Electronics and Telecommunication Engineering",
                        "B.Tech. Computer Science And Engineering",
                      ].includes(formData.program) &&
                      Array.from({ length: 8 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    {formData.program &&
                      [
                        "Master of Computer Applications",
                        "M.Tech. (Electronics & Telecommunication)",
                        "M.Tech. (Computer Engineering)",
                      ].includes(formData.program) &&
                      Array.from({ length: 4 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    CGPA (0-10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    name="cgpa"
                    placeholder="e.g. 8.45"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="e.g. Java, React, MongoDB"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
                >
                  Add Student
                </button>
              </form>
            )}
          </div>
          {/* Show AddInternship and AddPlacement forms only if last semester */}
          {newStudentId &&
            formData.semester &&
            (() => {
              const isUG = [
                "B.Tech. Computer Engineering",
                "B.Tech. Electronics and Telecommunication Engineering",
                "B.Tech. Computer Science And Engineering",
              ].includes(formData.program);
              const isPG = [
                "Master of Computer Applications",
                "M.Tech. (Electronics & Telecommunication)",
                "M.Tech. (Computer Engineering)",
              ].includes(formData.program);
              if (
                (isUG && Number(formData.semester) === 8) ||
                (isPG && Number(formData.semester) === 4)
              ) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                      <h2 className="text-xl font-bold mb-4">Add Internship</h2>
                      <AddInternship studentId={newStudentId} />
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                      <h2 className="text-xl font-bold mb-4">Add Placement</h2>
                      <AddPlacement studentId={newStudentId} />
                    </div>
                  </div>
                );
              }
              return null;
            })()}
        </div>
      </div>
    </div>
  );
}
