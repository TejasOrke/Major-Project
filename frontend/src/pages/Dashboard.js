import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaUserGraduate, FaBriefcase, FaClipboardList } from "react-icons/fa"; // Import icons

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
            <p className="text-lg mt-2 text-gray-200">Manage student records efficiently!</p>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Student Count Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 hover:shadow-xl transition">
              <FaUserGraduate className="text-blue-400 text-4xl" />
              <div>
                <p className="text-lg font-semibold text-gray-300">Total Students</p>
                <p className="text-2xl font-bold text-white">150+</p>
              </div>
            </div>

            {/* Internships Count Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 hover:shadow-xl transition">
              <FaBriefcase className="text-green-400 text-4xl" />
              <div>
                <p className="text-lg font-semibold text-gray-300">Internships</p>
                <p className="text-2xl font-bold text-white">80+</p>
              </div>
            </div>

            {/* Placement Count Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 hover:shadow-xl transition">
              <FaClipboardList className="text-purple-400 text-4xl" />
              <div>
                <p className="text-lg font-semibold text-gray-300">Placements</p>
                <p className="text-2xl font-bold text-white">60+</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl transition">
                ➕ Add Student
              </button>
              <button className="bg-green-600 text-white p-4 rounded-lg shadow-md hover:bg-green-700 hover:shadow-xl transition">
                📄 View Internships
              </button>
              <button className="bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 hover:shadow-xl transition">
                📊 Placement Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
