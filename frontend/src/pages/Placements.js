import React, { useState, useEffect } from "react";
import { getPlacements, getPlacementStatistics } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { FaChartBar, FaFilePdf, FaFileExcel, FaFilter } from "react-icons/fa";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function Placements() {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState([]);
  const [filteredPlacements, setFilteredPlacements] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table, charts
  const user = { role: "admin" }; // Replace this with actual user data fetching logic
  const [filters, setFilters] = useState({
    company: "",
    department: "",
    year: new Date().getFullYear(),
    packageAbove: "",
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFCCCB', '#A569BD'];

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch placements data
        const placementsResponse = await getPlacements();
        setPlacements(placementsResponse.data);
        setFilteredPlacements(placementsResponse.data);
        
        // Fetch statistics
        const statsResponse = await getPlacementStatistics();
        setStatistics(statsResponse.data);
      } catch (err) {
        console.error("Error fetching placement data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...placements];
    
    if (filters.company) {
      result = result.filter(item => 
        item.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    if (filters.department) {
      result = result.filter(item => 
        item.student?.department?.toLowerCase() === filters.department.toLowerCase()
      );
    }
    
    if (filters.year) {
      result = result.filter(item => {
        const placementDate = new Date(item.placementDate);
        return placementDate.getFullYear() === parseInt(filters.year);
      });
    }
    
    if (filters.packageAbove) {
      const minPackage = parseFloat(filters.packageAbove);
      result = result.filter(item => {
        const packageValue = parseFloat(item.package);
        return !isNaN(packageValue) && packageValue >= minPackage;
      });
    }
    
    setFilteredPlacements(result);
  }, [placements, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      company: "",
      department: "",
      year: new Date().getFullYear(),
      packageAbove: "",
    });
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    const headers = ['Student Name', 'Roll No', 'Department', 'Company', 'Package (LPA)', 'Placement Date'];
    
    const csvData = filteredPlacements.map(placement => [
      placement.student?.name || '',
      placement.student?.rollNo || '',
      placement.student?.department || '',
      placement.company,
      placement.package,
      new Date(placement.placementDate).toLocaleDateString()
    ]);
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `placement_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredPlacements.length) return {};
    
    // Company distribution
    const companyData = {};
    filteredPlacements.forEach(p => {
      companyData[p.company] = (companyData[p.company] || 0) + 1;
    });
    
    const companyChartData = Object.keys(companyData).map(company => ({
      name: company,
      value: companyData[company]
    })).sort((a, b) => b.value - a.value).slice(0, 8); // Top 8 companies
    
    // Department distribution
    const deptData = {};
    filteredPlacements.forEach(p => {
      const dept = p.student?.department || 'Unknown';
      deptData[dept] = (deptData[dept] || 0) + 1;
    });
    
    const departmentChartData = Object.keys(deptData).map(dept => ({
      name: dept,
      value: deptData[dept]
    }));
    
    // Package ranges
    const packageRanges = [
      { range: '< 5 LPA', count: 0 },
      { range: '5-10 LPA', count: 0 },
      { range: '10-15 LPA', count: 0 },
      { range: '15-20 LPA', count: 0 },
      { range: '> 20 LPA', count: 0 },
    ];
    
    filteredPlacements.forEach(p => {
      const packageValue = parseFloat(p.package);
      if (!isNaN(packageValue)) {
        if (packageValue < 5) packageRanges[0].count++;
        else if (packageValue < 10) packageRanges[1].count++;
        else if (packageValue < 15) packageRanges[2].count++;
        else if (packageValue < 20) packageRanges[3].count++;
        else packageRanges[4].count++;
      }
    });
    
    // Monthly placement trend for current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = months.map(month => ({ month, count: 0 }));
    
    filteredPlacements.forEach(p => {
      const date = new Date(p.placementDate);
      if (date.getFullYear() === parseInt(filters.year)) {
        trendData[date.getMonth()].count++;
      }
    });
    
    return {
      companyChartData,
      departmentChartData,
      packageRanges,
      trendData
    };
  };
  
  const chartData = prepareChartData();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
<div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
  <h1 className="text-2xl font-bold mb-4 md:mb-0">Placement Reports</h1>
  
  {/* Replace the button group with this improved version */}
  <div className="flex flex-wrap gap-2">
    <button 
      onClick={() => setViewMode(viewMode === 'table' ? 'charts' : 'table')}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition flex items-center"
    >
      <FaChartBar className="mr-1" /> 
      {viewMode === 'table' ? 'Charts' : 'Table'}
    </button>
    
    {user?.role === "admin" && (
      <button 
        onClick={() => navigate('/add-placement')}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition flex items-center"
      >
        <FaPlus className="mr-1" /> Add
      </button>
    )}
    
    <button 
      onClick={exportToCSV}
      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition flex items-center"
    >
      <FaFileExcel className="mr-1" /> Export
    </button>
    
    <button 
      onClick={clearFilters}
      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition flex items-center"
    >
      <FaFilter className="mr-1" /> Filters
    </button>
  </div>
</div>

          {/* Summary Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Total Placements</h3>
                <p className="text-3xl mt-2">{statistics.totalPlacements}</p>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Average Package</h3>
                <p className="text-3xl mt-2">₹{statistics.avgPackage} LPA</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Highest Package</h3>
                <p className="text-3xl mt-2">₹{statistics.highestPackage} LPA</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">Placement Rate</h3>
                <p className="text-3xl mt-2">{statistics.placementRate}%</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3">Filter Placements</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Filter by company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  placeholder="Filter by department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Package Above (LPA)</label>
                <input
                  type="number"
                  name="packageAbove"
                  placeholder="Min package"
                  value={filters.packageAbove}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Content - Table or Charts */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl">Loading placement data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-700 text-white p-4 rounded-lg">
              <p>Error: {error}</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Package (LPA)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Offer Letter
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredPlacements.length > 0 ? (
                    filteredPlacements.map((placement) => (
                      <tr key={placement._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            to={`/student/${placement.student?._id}`}
                            className="text-blue-400 hover:underline"
                          >
                            {placement.student?.name || 'N/A'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {placement.student?.rollNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {placement.student?.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {placement.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {placement.package}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(placement.placementDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {placement.offerLetter ? (
                            <a 
                              href={`http://localhost:5000/${placement.offerLetter}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center"
                            >
                              <FaFilePdf className="mr-1" /> View
                            </a>
                          ) : (
                            <span className="text-gray-400">Not Available</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        No placement records found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Charts View */
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Placement Trend Chart */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Placements Trend ({filters.year})</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Package Range Distribution */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Package Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.packageRanges}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="range" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="count" name="Students" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Company Distribution */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Top Recruiting Companies</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.companyChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.companyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Department Distribution */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Department-wise Placements</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.departmentChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.departmentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}