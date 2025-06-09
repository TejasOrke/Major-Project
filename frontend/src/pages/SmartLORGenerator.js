import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getStudentById, generateSmartLOR, getLORRecommendations } from '../api/api';
import { FaUserGraduate, FaUniversity, FaGraduationCap, FaRobot, FaMagic, FaFileAlt, FaSpinner } from 'react-icons/fa';

export default function SmartLORGenerator() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    purpose: '',
    university: '',
    program: '',
  });

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await getStudentById(studentId);
      setStudent(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to load student details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update the error handling in the analyzeStudent function:

const analyzeStudent = async () => {
  try {
    setAnalyzing(true);
    setError(null);
    
    const response = await getLORRecommendations(studentId);
    setRecommendations(response.data.recommendations);
    
    setAnalyzing(false);
  } catch (err) {
    console.error("Error analyzing student data:", err);
    
    // More specific error messages based on the error type
    if (err.message === 'Network Error') {
      setError("Network error: Please check your connection or server status");
    } else if (err.response) {
      // The request was made and the server responded with an error status
      setError(`Server error: ${err.response.data.message || err.response.statusText}`);
    } else {
      setError("Failed to analyze student data. Please try again later.");
    }
    
    setAnalyzing(false);
  }
};

  const handleGenerateLOR = async (e) => {
  e.preventDefault();
  
  try {
    setGenerating(true);
    setError(null);
    
    // Validate form
    if (!formData.purpose || !formData.university || !formData.program) {
      setError("Please fill all required fields");
      setGenerating(false);
      return;
    }
    
    const response = await generateSmartLOR({
      studentId,
      purpose: formData.purpose,
      university: formData.university,
      program: formData.program
    });
    
    // Navigate to LOR detail page
    navigate(`/lor/${response.data.lorRequest._id}`);
    
  } catch (err) {
    console.error("Error generating LOR:", err);
    
    // More specific error messages based on the error type
    if (err.message === 'Network Error') {
      setError("Network error: Please check your connection and try again");
    } else if (err.response) {
      // Server responded with an error status code
      const serverMessage = err.response.data.message || err.response.statusText;
      setError(`Server error: ${serverMessage}`);
      
      // If Python execution failed, provide more context
      if (serverMessage.includes("Python") || serverMessage.includes("script")) {
        setError(`AI generation error: ${serverMessage}. The AI system might be temporarily unavailable.`);
      }
    } else {
      setError("Failed to generate LOR. Please try again later.");
    }
    
    setGenerating(false);
  }
};
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6 flex justify-center items-center h-full">
            <p className="text-xl">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-600 text-white p-4 rounded-lg">{error}</div>
            <button 
              onClick={() => navigate('/students')} 
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Students
            </button>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">AI-Powered LOR Generator</h1>
            <button 
              onClick={() => navigate(`/student/${studentId}`)} 
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Student Profile
            </button>
          </div>
          
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Info Panel */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserGraduate className="mr-2" /> Student Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="font-medium">{student?.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Roll Number</p>
                  <p>{student?.rollNo}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Department</p>
                  <p>{student?.department?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">CGPA</p>
                  <p>{student?.cgpa || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Skills</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {student?.skills?.length > 0 ? (
                      student.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-blue-900 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills listed</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={analyzeStudent}
                  disabled={analyzing}
                  className={`w-full p-2 rounded flex items-center justify-center ${
                    analyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {analyzing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FaRobot className="mr-2" />
                      Analyze Student Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LOR Generation Form */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaFileAlt className="mr-2" /> Generate LOR
              </h2>
              
              <form onSubmit={handleGenerateLOR} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Purpose of LOR</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a purpose</option>
                    <option value="Graduate School">Graduate School</option>
                    <option value="PhD Program">PhD Program</option>
                    <option value="Job Application">Job Application</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Internship">Internship</option>
                    <option value="Research Position">Research Position</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <FaUniversity className="inline mr-1" /> University/Organization
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="e.g., Stanford University"
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <FaGraduationCap className="inline mr-1" /> Program/Position
                  </label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    placeholder="e.g., MS in Computer Science"
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={generating}
                  className={`w-full p-2 mt-4 rounded flex items-center justify-center ${
                    generating ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {generating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Generating LOR...
                    </>
                  ) : (
                    <>
                      <FaMagic className="mr-2" />
                      Generate Smart LOR
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Recommendations Panel */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaRobot className="mr-2" /> AI Recommendations
              </h2>
              
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-400">{rec.area}</h3>
                      <p className="text-sm mt-1">{rec.suggestion}</p>
                      <div className="mt-2 text-xs inline-block bg-gray-600 px-2 py-1 rounded">
                        Recommended: {rec.templateType}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <FaRobot className="text-5xl text-gray-600 mb-4" />
                  <p className="text-gray-400">
                    {analyzing ? 
                      "Analyzing student data..." : 
                      "Click 'Analyze Student Profile' to get AI-powered recommendations for this LOR"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}