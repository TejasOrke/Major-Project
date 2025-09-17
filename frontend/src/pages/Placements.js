import React, { useState, useEffect } from "react";
import { getPlacements, getPlacementStatistics } from "../api";
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300">Placements Overview</h1>
              <p className="text-sm text-gray-400 mt-1">Explore placement outcomes, trends, and distributions with interactive views.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setViewMode(viewMode === 'table' ? 'charts' : 'table')} className="px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-500 border border-blue-400/40 text-sm font-medium shadow-sm flex items-center gap-2 transition"><FaChartBar /> {viewMode === 'table' ? 'Charts View' : 'Table View'}</button>
              {user?.role === "admin" && (
                <button onClick={() => navigate('/add-placement')} className="px-4 py-2 rounded-lg bg-green-600/80 hover:bg-green-500 border border-green-400/40 text-sm font-medium shadow-sm flex items-center gap-2 transition"><FaPlus /> Add</button>
              )}
              <button onClick={exportToCSV} className="px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-500 border border-purple-400/40 text-sm font-medium shadow-sm flex items-center gap-2 transition"><FaFileExcel /> Export</button>
              <button onClick={clearFilters} className="px-4 py-2 rounded-lg bg-gray-700/70 hover:bg-gray-600/70 border border-gray-500/40 text-sm font-medium shadow-sm flex items-center gap-2 transition"><FaFilter /> Reset Filters</button>
            </div>
          </div>

          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Placements" value={statistics.totalPlacements} gradient="from-blue-600/80 to-indigo-600/80" />
              <StatCard title="Avg Package (LPA)" value={`₹${statistics.avgPackage}`} gradient="from-emerald-600/80 to-teal-600/80" />
              <StatCard title="Highest Package" value={`₹${statistics.highestPackage}`} gradient="from-fuchsia-600/80 to-pink-600/80" />
              <StatCard title="Placement Rate" value={`${statistics.placementRate}%`} gradient="from-amber-500/80 to-orange-600/80" />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-6 items-start">
            <div className="space-y-8">
              <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 shadow-lg">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-4 flex items-center gap-2"><FaFilter className="text-teal-300" /> Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <FilterInput label="Company" name="company" value={filters.company} onChange={handleFilterChange} placeholder="e.g., Google" />
                  <FilterInput label="Department" name="department" value={filters.department} onChange={handleFilterChange} placeholder="e.g., CSE" />
                  <div>
                    <label className="block text-xs font-medium mb-1 tracking-wide text-gray-300">Year</label>
                    <select name="year" value={filters.year} onChange={handleFilterChange} className="w-full rounded-md px-3 py-2 bg-gray-900/60 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>
                  <FilterInput type="number" label="Package ≥ (LPA)" name="packageAbove" value={filters.packageAbove} onChange={handleFilterChange} placeholder="Min" />
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-10 text-center text-gray-300">Loading placement data...</div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/40 bg-red-800/40 backdrop-blur-xl p-6 text-sm">Error: {error}</div>
              ) : viewMode === 'table' ? (
                <div className="rounded-2xl border border-gray-600/40 bg-gray-900/50 backdrop-blur-xl p-0 overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-800/70">
                        <tr className="text-xs uppercase tracking-wide text-gray-300">
                          <Th>Student Name</Th>
                          <Th>Roll No</Th>
                          <Th>Department</Th>
                          <Th>Company</Th>
                          <Th>Package (LPA)</Th>
                          <Th>Date</Th>
                          <Th>Offer Letter</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/60">
                        {filteredPlacements.length ? filteredPlacements.map(placement => (
                          <tr key={placement._id} className="hover:bg-gray-800/60 transition">
                            <Td><Link to={`/student/${placement.student?._id}`} className="text-indigo-300 hover:text-indigo-200 hover:underline">{placement.student?.name || 'N/A'}</Link></Td>
                            <Td>{placement.student?.rollNo || 'N/A'}</Td>
                            <Td>{placement.student?.department || 'N/A'}</Td>
                            <Td className="font-medium text-gray-100">{placement.company}</Td>
                            <Td className="text-emerald-300 font-semibold">{placement.package}</Td>
                            <Td>{new Date(placement.placementDate).toLocaleDateString()}</Td>
                            <Td>{placement.offerLetter ? <a href={`http://localhost:5000/${placement.offerLetter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-300 hover:text-blue-200"><FaFilePdf className="text-sm" />View</a> : <span className="text-gray-500">N/A</span>}</Td>
                          </tr>
                        )) : (
                          <tr><td colSpan="7" className="py-8 text-center text-gray-400">No placement records match filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartPanel title={`Placements Trend (${filters.year})`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} labelStyle={{ color: '#fff' }} />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} activeDot={{ r: 7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartPanel>
                    <ChartPanel title="Package Distribution">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.packageRanges}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="range" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} labelStyle={{ color: '#fff' }} />
                          <Legend />
                          <Bar dataKey="count" name="Students" fill="#34d399" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartPanel>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <ChartPanel title="Top Recruiting Companies">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData.companyChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                            {chartData.companyChartData.map((entry,index)=>(<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartPanel>
                    <ChartPanel title="Department-wise Placements">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={chartData.departmentChartData} cx="50%" cy="50%" outerRadius={80} fill="#6366f1" dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                            {chartData.departmentChartData.map((entry,index)=>(<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartPanel>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Rail */}
            <div className="hidden xl:block">
              <div className="sticky top-32 space-y-6">
                <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 shadow-lg text-[11px] text-gray-300">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200 mb-3 flex items-center gap-2"><FaChartBar className="text-sky-300" /> Insights</h3>
                  <ul className="space-y-2 leading-snug">
                    <li>Switch between table and charts for different analytical perspectives.</li>
                    <li>Use filters to isolate cohorts or performance tiers.</li>
                    <li>Export filtered dataset for offline analysis.</li>
                  </ul>
                </div>
                {!filteredPlacements.length && !loading && (
                  <div className="rounded-2xl border border-yellow-500/40 bg-yellow-800/30 backdrop-blur-xl p-5 shadow-lg text-[11px] text-yellow-100">
                    <h3 className="text-sm font-semibold mb-2">No Results Tip</h3>
                    <p>Broaden filters or clear them to restore the full dataset.</p>
                  </div>
                )}
                <div className="rounded-2xl border border-gray-600/40 bg-gradient-to-br from-indigo-800/40 via-purple-800/30 to-fuchsia-800/30 backdrop-blur-xl p-5 shadow-lg text-[11px] text-gray-300">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200 mb-3">Suggestions</h3>
                  <ul className="space-y-2 leading-snug">
                    <li>Add advanced filters (range slider for package).</li>
                    <li>Introduce company logos for visual recall.</li>
                    <li>Drill-down view with student placement timelines.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Presentational Helpers ---
function StatCard({ title, value, gradient }) {
  return (
    <div className={`relative group rounded-2xl border border-gray-600/40 bg-gradient-to-br ${gradient} backdrop-blur-xl p-4 shadow-lg overflow-hidden`}>      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-white/10 via-transparent to-white/0" />
      <p className="text-[11px] uppercase tracking-wide text-gray-200/90 font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function FilterInput({ label, name, value, onChange, placeholder, type='text' }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 tracking-wide text-gray-300">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-md px-3 py-2 bg-gray-900/60 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500" />
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 shadow-lg h-80">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Th({ children }) { return <th className="px-5 py-3 text-left">{children}</th>; }
function Td({ children }) { return <td className="px-5 py-3 whitespace-nowrap text-sm">{children}</td>; }