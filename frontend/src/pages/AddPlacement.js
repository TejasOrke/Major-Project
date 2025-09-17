import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { addPlacement, getStudentById, getAllStudents } from "../api";

export default function AddPlacement() {
  const { studentId } = useParams();
  const [formData, setFormData] = useState({
    student: studentId || "",
    company: "",
    position: "Software Engineer",
    package: "",
    placementDate: new Date().toISOString().split("T")[0],
    offerLetter: null
  });
  
  const [message, setMessage] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is an admin
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    
    // Redirect if user is not admin
    if (!storedUser || storedUser.role !== "admin") {
      setMessage("Access denied. Admin privileges required.");
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    // Fetch students list for dropdown
    const fetchStudents = async () => {
      try {
        const response = await getAllStudents();
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    
    // If studentId is provided, fetch student details
    const fetchStudentDetails = async () => {
      if (studentId) {
        try {
          const response = await getStudentById(studentId);
          setStudentInfo(response.data);
          setFormData(prev => ({
            ...prev,
            student: response.data._id
          }));
        } catch (error) {
          console.error("Error fetching student details:", error);
        }
      }
    };
    
    fetchStudents();
    fetchStudentDetails();
  }, [navigate, studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      offerLetter: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'offerLetter' && formData[key]) {
          formDataToSend.append('offerLetter', formData[key]);
        } else if (key !== 'offerLetter') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      await addPlacement(formDataToSend);
      setMessage("Placement record added successfully!");
      
      // Reset form or redirect
      setTimeout(() => {
        navigate("/placements");
      }, 2000);
    } catch (error) {
      console.error("Error adding placement:", error);
      setMessage(error.response?.data?.message || "An error occurred while adding placement");
    }
    
    setLoading(false);
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
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
              Add Placement {studentInfo && `for ${studentInfo.name}`}
            </h1>
            
            {message && (
              <div className={`p-3 rounded mb-4 ${message.includes('successfully') ? 'bg-green-600' : 'bg-red-600'}`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Selection */}
              {!studentId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Student</label>
                  <select
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Company */}
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
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
              
              {/* Position */}
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input
                  type="text"
                  name="position"
                  placeholder="Enter job position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Package */}
              <div>
                <label className="block text-sm font-medium mb-1">Package (LPA)</label>
                <input
                  type="text"
                  name="package"
                  placeholder="Enter package in LPA (e.g., 12.5)"
                  value={formData.package}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Placement Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Placement Date</label>
                <input
                  type="date"
                  name="placementDate"
                  value={formData.placementDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* Offer Letter Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Offer Letter (PDF)</label>
                <input
                  type="file"
                  name="offerLetter"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition duration-200"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Placement Record"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}