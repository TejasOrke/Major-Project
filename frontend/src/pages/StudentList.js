import { useEffect, useState } from "react";
import { getStudents } from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function StudentList() {
  const [students, setStudents] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);  // Add loading state
  const [error, setError] = useState(null);      // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudents();
        setStudents(data || []); // Ensure we always have an array
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Students</h1>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Name</th>
                <th className="border p-2">Roll No</th>
                <th className="border p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <tr key={student._id} className="border">
                    <td
                      className="border p-2 text-blue-500 cursor-pointer underline"
                      onClick={() => navigate(`/student/${student._id}`)}
                    >
                      {student.name}
                    </td>
                    <td className="border p-2">{student.rollNo}</td>
                    <td className="border p-2">{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-4">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}