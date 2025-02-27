import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentById } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdown states
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [showInternship, setShowInternship] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudentById(id);
        setStudent(data);
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

          {/* Internship Details Dropdown */}
          <div className="mt-4 bg-gray-800 shadow-md rounded-lg">
            <button
              onClick={() => setShowInternship(!showInternship)}
              className="w-full text-left p-3 font-semibold text-lg bg-green-600 text-white rounded-t-lg flex justify-between items-center hover:bg-green-700 transition"
            >
              Internship Details
              <span>{showInternship ? "▲" : "▼"}</span>
            </button>
            {showInternship && (
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                {student.internships && student.internships.length > 0 ? (
                  <ul>
                    {student.internships.map((internship, index) => (
                      <li key={index} className="p-3 border-b border-gray-700">
                        <strong>Company:</strong> {internship.company} <br />
                        <strong>Duration:</strong> {internship.duration} <br />
                        <strong>Status:</strong> {internship.status}
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
