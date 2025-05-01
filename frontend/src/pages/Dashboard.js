import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaBriefcase, FaClipboardList } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Sample data for charts - replace with your actual data from API
  const placementData = [
    { name: 'Jan', count: 12 },
    { name: 'Feb', count: 19 },
    { name: 'Mar', count: 15 },
    { name: 'Apr', count: 25 },
    { name: 'May', count: 32 },
    { name: 'Jun', count: 27 },
  ];

  const internshipData = [
    { name: 'Web Dev', value: 35 },
    { name: 'Data Science', value: 25 },
    { name: 'ML/AI', value: 20 },
    { name: 'Mobile Dev', value: 15 },
    { name: 'DevOps', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}!</h1>
            <p className="mt-2 opacity-90">Here's your placement dashboard overview</p>
          </div>
          
          {/* Stats & Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Placement Trend Chart */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Placement Trends</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={placementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Internship Distribution */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Internship Distribution</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={internshipData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {internshipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

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