import { useEffect, useState } from "react";
import { getLORs } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function LORList() {
  const [lors, setLORs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Set isAdmin based on user role (Runs Once)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(user?.role === "admin");
  }, []);

  // Fetch LORs from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getLORs();
        console.log("Fetched LORs:", data); // Debugging API response
        setLORs(data || []);
      } catch (err) {
        console.error("Error fetching LORs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Letters of Recommendation</h1>

          {lors.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Roll No</th>
                  {isAdmin && <th className="border p-2">Faculty Name</th>}
                  <th className="border p-2">Issued Date</th>
                  <th className="border p-2">Document</th>
                </tr>
              </thead>
              <tbody>
                {lors.map((lor) => (
                  <tr key={lor._id} className="border hover:bg-gray-50">
                    <td className="border p-2">{lor.student?.name || "N/A"}</td>
                    <td className="border p-2">{lor.student?.rollNo || "N/A"}</td>
                    {isAdmin && <td className="border p-2">{lor.faculty?.name || "N/A"}</td>}
                    <td className="border p-2">{lor.issuedAt ? new Date(lor.issuedAt).toLocaleDateString() : "N/A"}</td>
                    <td className="border p-2">
                      {lor.lorDocument ? (
                        <a
                          href={`http://localhost:5000/${lor.lorDocument}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View LOR
                        </a>
                      ) : (
                        <span className="text-gray-400">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded">
              No letters of recommendation found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
