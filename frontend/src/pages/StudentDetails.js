import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentById } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaBriefcase, FaRobot } from "react-icons/fa"; // Import the icons

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Add this hook

  // Dropdown states
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [showInternship, setShowInternship] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);

  useEffect(() => {
    // Get the logged-in user for role check
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudentById(id);
        
        // Make sure internships property exists
        const studentData = {
          ...data,
          internships: data.internships || []
        };
        
        setStudent(studentData);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center text-white p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-400 p-10">Error: {error}</div>;
  if (!student) return <div className="text-center text-gray-300 p-10">No student found</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-200">{student.name}'s Details</h1>
          <p className="text-gray-400 mt-2">
            <strong>Roll No:</strong> {student.rollNo}
          </p>
          <p className="text-gray-400">
            <strong>Email:</strong> {student.email}
          </p>

          {/* Admit Card Dropdown */}
          <div className="mt-6 bg-gray-800 shadow-md rounded-lg">
            <button
              onClick={() => setShowAdmitCard(!showAdmitCard)}
              className="w-full text-left p-3 font-semibold text-lg bg-blue-600 text-white rounded-t-lg flex justify-between items-center hover:bg-blue-700 transition"
            >
              Admit Card
              <span>{showAdmitCard ? "▲" : "▼"}</span>
            </button>
            {showAdmitCard && (
              <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-center">
                {student.admitCard ? (
                  <img
                    src={`http://localhost:5000/${student.admitCard}`}
                    alt="Admit Card"
                    className="max-w-full max-h-80 border border-gray-600 rounded-md shadow-md"
                  />
                ) : (
                  <p className="text-gray-400">Not Uploaded</p>
                )}
              </div>
            )}
          </div>

          {/* Internship Details Dropdown with Add Internship Button for Admins */}
          <div className="mt-4 bg-gray-800 shadow-md rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-green-600 rounded-t-lg">
              <button
                onClick={() => setShowInternship(!showInternship)}
                className="text-left p-3 font-semibold text-lg text-white flex-grow hover:bg-green-700 transition"
              >
                Internship Details
                <span className="ml-2">{showInternship ? "▲" : "▼"}</span>
              </button>

                <button
    onClick={() => navigate(`/smart-lor/${student._id}`)}
    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
  >
    <FaRobot className="mr-2" />
    Smart LOR
  </button>
              
              {/* Add Internship Button - Only visible to admins */}
              {user?.role === "admin" && (
                <button
                  onClick={() => navigate(`/add-internship/${student._id}`)}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 m-2 rounded-md font-medium flex items-center gap-2"
                >
                  <FaBriefcase /> Add Internship
                </button>
              )}
            </div>
            
            {showInternship && (
  <div className="p-4 border-t border-gray-700 bg-gray-900">
    {student.internships && student.internships.length > 0 ? (
      <ul className="space-y-4">
        {student.internships.map((internship, index) => (
          <li key={index} className="bg-gray-800 p-4 rounded-md shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">{internship.company}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                internship.status === 'Completed' ? 'bg-green-700' : 
                internship.status === 'Ongoing' ? 'bg-blue-600' : 
                internship.status === 'Terminated' ? 'bg-red-700' : 'bg-yellow-600'
              }`}>
                {internship.status}
              </span>
            </div>
            
            <p className="text-gray-300 mt-2">
              <strong>Position:</strong> {internship.position}
            </p>
            
            <p className="text-gray-300">
              <strong>Duration:</strong> {new Date(internship.startDate).toLocaleDateString()} - 
              {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Present'}
            </p>
            
            {internship.stipend && (
              <p className="text-gray-300">
                <strong>Stipend:</strong> ₹{internship.stipend}/month
              </p>
            )}
            
            {internship.description && (
              <div className="mt-2">
                <strong>Description:</strong> 
                <p className="text-gray-400 mt-1">{internship.description}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">No Internship Records</p>
    )}
  </div>
)}
          </div>

          {/* Placement Details Dropdown */}
          <div className="mt-4 bg-gray-800 shadow-md rounded-lg">
            <button
              onClick={() => setShowPlacement(!showPlacement)}
              className="w-full text-left p-3 font-semibold text-lg bg-purple-600 text-white rounded-t-lg flex justify-between items-center hover:bg-purple-700 transition"
            >
              Placement Details
              <span>{showPlacement ? "▲" : "▼"}</span>
{user?.role === "admin" && (
  <button
    onClick={() => navigate(`/add-placement/${student._id}`)}
    className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 m-2 rounded-md font-medium flex items-center gap-2"
  >
    <FaBriefcase /> Add Placement
  </button>
)}
            </button>
            {showPlacement && (
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                {student.placement ? (
                  <div className="p-3">
                    <p>
                      <strong>Company:</strong> {student.placement.company}
                    </p>
                    <p>
                      <strong>Package:</strong> {student.placement.package}
                    </p>
                    <p>
                      <strong>Offer Letter:</strong>{" "}
                      {student.placement.offerLetter ? (
                        <a
                          href={`http://localhost:5000/${student.placement.offerLetter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline hover:text-blue-500"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">Not Uploaded</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No Placement Records</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}