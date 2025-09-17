import { useEffect, useState } from "react";
import { getLORs } from "../api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function LORList() {
  const [lors, setLORs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Stored User:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.warn("No user found in localStorage");
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getLORs();
        console.log("Fetched LORs:", data);
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

  if (loading) return <div className="text-center p-10 text-gray-300">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-400">Error: {error}</div>;

  return (
    <div className="flex bg-gray-900 text-gray-200 min-h-screen">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-100">Letters of Recommendation</h1>

          {lors.length > 0 ? (
            <table className="w-full border-collapse border border-gray-700">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  <th className="border border-gray-700 p-2">Student Name</th>
                  <th className="border border-gray-700 p-2">Roll No</th>
                  {user?.role === "admin" && <th className="border border-gray-700 p-2">Faculty Name</th>}
                  <th className="border border-gray-700 p-2">Issued Date</th>
                  <th className="border border-gray-700 p-2">Document</th>
                </tr>
              </thead>
              <tbody>
                {lors.map((lor) => (
                  <tr key={lor._id} className="border border-gray-700 hover:bg-gray-800">
                    <td className="border border-gray-700 p-2">{lor.student?.name || "N/A"}</td>
                    <td className="border border-gray-700 p-2">{lor.student?.rollNo || "N/A"}</td>
                    {user?.role === "admin" && (
                      <td className="border border-gray-700 p-2">{lor.faculty?.name || "N/A"}</td>
                    )}
                    <td className="border border-gray-700 p-2">
                      {lor.issuedAt ? new Date(lor.issuedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="border border-gray-700 p-2">
                      {lor.lorDocument ? (
                        <a
                          href={`http://localhost:5000/${lor.lorDocument}`}  // Fixed string template syntax
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          View LOR
                        </a>
                      ) : (
                        <span className="text-gray-500">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-4 bg-gray-800 text-gray-400 rounded">
              No letters of recommendation found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}