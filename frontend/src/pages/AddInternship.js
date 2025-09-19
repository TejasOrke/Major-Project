import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addInternship, getStudentById } from "../api";

export default function AddInternship({ studentId: propStudentId }) {
  const { studentId: paramStudentId } = useParams();
  const studentId = propStudentId || paramStudentId || "";
  const [formData, setFormData] = useState({
    studentId: studentId,
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    stipend: "",
    status: "Applied",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (!storedUser || storedUser.role !== "admin") {
      setMessage("Access denied. Admin privileges required.");
      if (!propStudentId) {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
      return;
    }

    if (studentId) {
      fetchStudentDetails();
    }
  }, [navigate, studentId, propStudentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await getStudentById(studentId);
      setStudent(response.data);
      setFormData((prev) => ({ ...prev, studentId }));
      setLoading(false);
    } catch (error) {
      setMessage("Error fetching student details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addInternship(formData);
      setMessage("Internship added successfully!");
      setLoading(false);
      if (!propStudentId) {
        setTimeout(() => navigate(`/student/${studentId}`), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {!propStudentId && <Sidebar />}
        <div className="w-full">
          {!propStudentId && <Navbar />}
          <div className="p-6">
            <div className="bg-red-600 text-white p-4 rounded-lg">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p>You need administrator privileges to access this page.</p>
              {!propStudentId && <p>Redirecting to dashboard...</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white ${
        propStudentId ? "" : ""
      }`}
    >
      {!propStudentId && <Sidebar />}
      <div className="w-full">
        {!propStudentId && <Navbar />}
        <div className="p-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">
              Add Internship {student ? `for ${student.name}` : ""}
            </h1>
            {message && (
              <p
                className={`p-3 rounded mb-4 ${
                  message.includes("success") ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!studentId && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="Enter student ID"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  placeholder="Enter position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter internship description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stipend (Optional)
                </label>
                <input
                  type="number"
                  name="stipend"
                  placeholder="Enter stipend amount"
                  value={formData.stipend}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Applied">Applied</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Internship"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
