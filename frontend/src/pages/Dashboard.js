import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate, Link } from "react-router-dom";
import { FaUserGraduate, FaBriefcase, FaClipboardList, FaFileAlt, FaFilePdf, FaFileSignature, FaChartBar, FaTools, FaRobot } from "react-icons/fa";
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

  // LOR statistics data
  const lorData = [
    { name: 'Pending', value: 8, color: '#FFBB28' },
    { name: 'Approved', value: 12, color: '#0088FE' },
    { name: 'Completed', value: 23, color: '#00C49F' },
    { name: 'Rejected', value: 3, color: '#FF8042' }
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
          
          {/* Feature Cards - NEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-5 rounded-lg shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 bg-purple-900 p-2 rounded-bl-lg">
                <FaFilePdf className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold mb-2">LOR Generation</h2>
              <p className="text-sm opacity-90 mb-4">
                Generate professional recommendation letters with custom templates
              </p>
              <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => navigate('/lors')}
                  className="bg-white text-purple-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100"
                >
                  Manage LORs
                </button>
              </div>
            </div>
            {/* Add this card to your feature cards section, after existing LOR cards */}



<div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 rounded-lg shadow-md relative overflow-hidden group">
  <div className="absolute right-0 top-0 bg-indigo-900 p-2 rounded-bl-lg">
    <FaRobot className="text-white text-xl" />
  </div>
  <h2 className="text-xl font-bold mb-2">AI LOR Generator</h2>
  <p className="text-sm opacity-90 mb-4">
    Create intelligent, data-driven LORs with our AI recommendation system
  </p>
  <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
    <button 
      onClick={() => navigate('/students')} // Keep navigation to student list
      className="bg-white text-indigo-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100"
    >
      Select Student
    </button>
  </div>
</div>

            <div className="bg-gradient-to-r from-green-600 to-green-800 p-5 rounded-lg shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 bg-green-900 p-2 rounded-bl-lg">
                <FaFileSignature className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold mb-2">LOR Templates</h2>
              <p className="text-sm opacity-90 mb-4">
                Create and manage customizable LOR templates for various purposes
              </p>
              <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => navigate('/lor-templates')}
                  className="bg-white text-green-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100"
                >
                  View Templates
                </button>
              </div>
            </div>

            
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-lg shadow-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 bg-blue-900 p-2 rounded-bl-lg">
                <FaChartBar className="text-white text-xl" />
              </div>
              <h2 className="text-xl font-bold mb-2">Placement Analytics</h2>
              <p className="text-sm opacity-90 mb-4">
                View comprehensive placement statistics and trends
              </p>
              <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => navigate('/placements')}
                  className="bg-white text-blue-700 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-100"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats & Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Placement Trend Chart */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md lg:col-span-2">
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

            {/* NEW: LOR Status Chart */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">LOR Status</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {lorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

            {/* NEW: Recent Activity */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="h-72 overflow-y-auto pr-2">
                <div className="space-y-3">
                  <div className="border-l-4 border-purple-500 pl-3 py-2 bg-gray-700 rounded-r">
                    <p className="font-medium">New LOR template created</p>
                    <p className="text-sm text-gray-300">Technical Skills Template - 2 hours ago</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-700 rounded-r">
                    <p className="font-medium">LOR request approved</p>
                    <p className="text-sm text-gray-300">John Doe - Stanford University - 5 hours ago</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-3 py-2 bg-gray-700 rounded-r">
                    <p className="font-medium">LOR PDF generated</p>
                    <p className="text-sm text-gray-300">Alice Smith - MIT - Yesterday</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-gray-700 rounded-r">
                    <p className="font-medium">New placement recorded</p>
                    <p className="text-sm text-gray-300">Mike Johnson - Google - Yesterday</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-3 py-2 bg-gray-700 rounded-r">
                    <p className="font-medium">New student added</p>
                    <p className="text-sm text-gray-300">Sarah Williams - CSE Department - 2 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Updated */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link to="/students" className="bg-blue-600 hover:bg-blue-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                <FaUserGraduate className="text-2xl mb-2" />
                <span className="text-sm">Students</span>
              </Link>

              <Link to="/internships" className="bg-green-600 hover:bg-green-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                <FaBriefcase className="text-2xl mb-2" />
                <span className="text-sm">Internships</span>
              </Link>

              <Link to="/lors" className="bg-purple-600 hover:bg-purple-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                <FaFileAlt className="text-2xl mb-2" />
                <span className="text-sm">LORs</span>
              </Link>

              <Link to="/lor-templates" className="bg-indigo-600 hover:bg-indigo-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                <FaFileSignature className="text-2xl mb-2" />
                <span className="text-sm">Templates</span>
              </Link>

              <Link to="/placements" className="bg-yellow-600 hover:bg-yellow-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                <FaChartBar className="text-2xl mb-2" />
                <span className="text-sm">Placements</span>
              </Link>
              
              {user?.role === "admin" && (
                <Link to="/approve-user" className="bg-red-600 hover:bg-red-700 text-center text-white p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center">
                  <FaTools className="text-2xl mb-2" />
                  <span className="text-sm">Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}