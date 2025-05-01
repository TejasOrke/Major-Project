import React, { useState, useEffect } from "react";
import { getInternships } from "../api/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    company: "",
    status: "",
    startDate: "",
  });
  const [sortField, setSortField] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getInternships();
        setInternships(data);
        setFilteredInternships(data);
      } catch (err) {
        console.error("Error fetching internships:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...internships];
    
    // Apply filters
    if (filters.company) {
      result = result.filter(item => 
        item.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(item => item.status === filters.status);
    }
    
    if (filters.startDate) {
      const filterDate = new Date(filters.startDate);
      result = result.filter(item => {
        const itemDate = new Date(item.startDate);
        return itemDate >= filterDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredInternships(result);
  }, [internships, filters, sortField, sortDirection]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (field) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  const clearFilters = () => {
    setFilters({
      company: "",
      status: "",
      startDate: "",
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Internships</h1>
            <div className="space-x-2">
              <button 
                onClick={clearFilters}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3">Filter Internships</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Applied">Applied</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Date (From)</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Internships List */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl">Loading internships...</p>
            </div>
          ) : error ? (
            <div className="bg-red-700 text-white p-4 rounded-lg">
              <p>Error: {error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700">
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('company')}
                    >
                      Company {sortField === 'company' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('position')}
                    >
                      Position {sortField === 'position' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('startDate')}
                    >
                      Duration {sortField === 'startDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Stipend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Student
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {filteredInternships.length > 0 ? (
                    filteredInternships.map((internship) => (
                      <tr key={internship._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">{internship.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{internship.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(internship.startDate).toLocaleDateString()} - 
                          {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Present'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {internship.stipend ? `₹${internship.stipend}/month` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            internship.status === 'Completed' ? 'bg-green-700' : 
                            internship.status === 'Ongoing' ? 'bg-blue-600' : 
                            internship.status === 'Terminated' ? 'bg-red-700' : 'bg-yellow-600'
                          }`}>
                            {internship.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {internship.studentId && (
                            <Link 
                              to={`/student/${internship.studentId._id || internship.studentId}`}
                              className="text-blue-400 hover:underline"
                            >
                              {internship.studentId.name || "View Student"}
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        No internships found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}