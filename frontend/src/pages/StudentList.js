import { useEffect, useState } from "react";
import { getStudents } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function StudentList() {
  const [students, setStudents] = useState([]);  // Original students list
  const [filteredStudents, setFilteredStudents] = useState([]); // Filtered list for display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search input state
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudents();
        setStudents(data || []);
        setFilteredStudents(data || []); // Initialize filtered list
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Function to handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter students based on roll number (partial match)
    const filtered = students.filter((student) =>
      student.rollNo.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  if (loading) return <div className="text-white text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-400 text-center p-6">Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-200">Students</h1>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Roll No."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full p-3 mb-4 border border-gray-600 bg-gray-800 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700 bg-gray-900 text-white shadow-lg">
              <thead>
                <tr className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-gray-200">
                  <th className="border border-gray-700 p-3 text-left">Name</th>
                  <th className="border border-gray-700 p-3 text-left">Roll No</th>
                  <th className="border border-gray-700 p-3 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border border-gray-700 hover:bg-gray-800 transition"
                    >
                      <td
                        className="border border-gray-700 p-3 text-blue-400 cursor-pointer underline hover:text-blue-500"
                        onClick={() => navigate(`/student/${student._id}`)}
                      >
                        {student.name}
                      </td>
                      <td className="border border-gray-700 p-3">{student.rollNo}</td>
                      <td className="border border-gray-700 p-3">{student.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-gray-300">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
