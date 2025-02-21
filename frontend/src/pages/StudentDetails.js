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

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!student) return <div className="text-center p-10">No student found</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold">{student.name}'s Details</h1>
          <p className="text-gray-700 mt-2">Roll No: {student.rollNo}</p>
          <p className="text-gray-700">Email: {student.email}</p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Admit Card</h2>
            <p>{student.admitCard ? student.admitCard : "Not Uploaded"}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Internship Details</h2>
            {student.internships && student.internships.length > 0 ? (
              <ul>
                {student.internships.map((internship, index) => (
                  <li key={index} className="border p-2 rounded mb-2">
                    {internship.company} - {internship.duration} ({internship.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Internship Records</p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">Placement Details</h2>
            {student.placement ? (
              <div className="border p-2 rounded">
                <p>Company: {student.placement.company}</p>
                <p>Package: {student.placement.package}</p>
                <p>Offer Letter: {student.placement.offerLetter || "Not uploaded"}</p>
              </div>
            ) : (
              <p>No Placement Records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}