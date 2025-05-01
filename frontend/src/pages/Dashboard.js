import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaBriefcase, FaClipboardList } from "react-icons/fa";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {/* ...existing welcome banner and statistics section... */}

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Add Student - Admin Only */}
              {user?.role === "admin" && (
                <button
                  onClick={() => navigate("/add-student")}
                  className="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl transition"
                >
                  ➕ Add Student
                </button>
              )}

              {/* View Internships - Available to All */}
              <button
                onClick={() => navigate("/internships")}
                className="bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 hover:shadow-xl transition"
              >
                📄 View Internships
              </button>

              {/* Placement Reports - Admin Only */}
              {user?.role === "admin" && (
                <button
                  onClick={() => navigate("/placements")}
                  className="bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 hover:shadow-xl transition"
                >
                  📊 Placement Reports
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}