import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudentById } from "../api"; // barrel import
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { FaBriefcase, FaRobot } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Add this hook

  // Dropdown states
  const [showAdmitCard, setShowAdmitCard] = useState(false);
  const [showInternship, setShowInternship] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);

  useEffect(() => {
    // Get the logged-in user for role check
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudentById(id);
        
        // Make sure internships property exists
        const studentData = {
          ...data,
          internships: data.internships || []
        };
        
        setStudent(studentData);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          <div className="glass rounded-2xl p-8 fade-in">
            <div className="space-y-4">
              <div className="skeleton h-8 w-1/3"></div>
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-4 w-1/4"></div>
              <div className="flex gap-3 mt-4">
                <div className="skeleton h-6 w-16 rounded-full"></div>
                <div className="skeleton h-6 w-20 rounded-full"></div>
                <div className="skeleton h-6 w-14 rounded-full"></div>
              </div>
            </div>
            <div className="divider" />
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {[...Array(2)].map((_,i) => (
                <div key={i} className="glass rounded-xl p-5 space-y-4">
                  <div className="skeleton h-6 w-32"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-2/3"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="text-center text-red-400 p-10">Error: {error}</div>;
  if (!student) return <div className="text-center text-gray-300 p-10">No student found</div>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white soft-scroll">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="max-w-6xl mx-auto p-8 space-y-10 fade-in">
          {/* Header Card */}
          <div className="glass rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-indigo-600/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-fuchsia-600/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-white to-pink-200 bg-clip-text text-transparent">
                    {student.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                      <span className="text-gray-400">Roll</span>
                      <span className="font-medium text-white">{student.rollNo}</span>
                    </div>
                    <div className="glass rounded-lg px-4 py-2 flex items-center gap-2 break-all">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium text-white">{student.email}</span>
                    </div>
                    {student.cgpa !== undefined && (
                      <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-gray-400">CGPA</span>
                        <span className="font-semibold text-emerald-300">{student.cgpa}</span>
                      </div>
                    )}
                  </div>
                  {student.skills && student.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="uppercase text-xs tracking-wider text-gray-500 mb-2 font-semibold">Skills</p>
                      <div className="flex flex-wrap -m-1">
                        {student.skills.map((skill, i) => (
                          <span key={i} className="chip">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start md:items-end gap-4 min-w-[220px]">
                  <button
                    onClick={() => navigate(`/smart-lor/${student._id}`)}
                    className="btn-primary-gradient px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md hover:shadow-indigo-500/25"
                  >
                    <FaRobot className="text-lg" />
                    Smart LOR
                  </button>
                  {user?.role === 'admin' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/add-internship/${student._id}`)}
                        className="glass px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition"
                      >
                        <FaBriefcase className="text-sm" /> Internship
                      </button>
                      <button
                        onClick={() => navigate(`/add-placement/${student._id}`)}
                        className="glass px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition"
                      >
                        <FaBriefcase className="text-sm" /> Placement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Admit Card & Placement */}
            <div className="space-y-8 lg:col-span-1">
              {/* Admit Card */}
              <div className="glass rounded-2xl p-6 card-hover">
                <button
                  onClick={() => setShowAdmitCard(!showAdmitCard)}
                  className="w-full flex justify-between items-center mb-4 group"
                >
                  <span className="panel-title">Admit Card</span>
                  {showAdmitCard ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                <div className="divider my-4" />
                {showAdmitCard && (
                  <div className="flex justify-center">
                    {student.admitCard ? (
                      <img
                        src={`http://localhost:5000/${student.admitCard}`}
                        alt="Admit Card"
                        className="max-w-full max-h-80 rounded-lg border border-white/10 shadow-md"
                      />
                    ) : (
                      <p className="text-gray-400 text-sm">Not Uploaded</p>
                    )}
                  </div>
                )}
              </div>

              {/* Placement */}
              <div className="glass rounded-2xl p-6 card-hover">
                <button
                  onClick={() => setShowPlacement(!showPlacement)}
                  className="w-full flex justify-between items-center mb-4"
                >
                  <span className="panel-title">Placement</span>
                  {showPlacement ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                <div className="divider my-4" />
                {showPlacement && (
                  student.placement ? (
                    <div className="space-y-3 text-sm">
                      <p><span className="text-gray-400">Company:</span> <span className="font-medium">{student.placement.company}</span></p>
                      <p><span className="text-gray-400">Package:</span> <span className="font-semibold text-emerald-300">{student.placement.package}</span></p>
                      <p className="flex items-center gap-2">
                        <span className="text-gray-400">Offer:</span>
                        {student.placement.offerLetter ? (
                          <a
                            href={`http://localhost:5000/${student.placement.offerLetter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
                          >
                            Download PDF
                          </a>
                        ) : (
                          <span className="text-gray-500">Not Uploaded</span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No Placement Records</p>
                  )
                )}
              </div>
            </div>

            {/* Right / Main Column: Internships */}
            <div className="glass rounded-2xl p-8 lg:col-span-2 card-hover">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <button onClick={() => setShowInternship(!showInternship)} className="flex items-center gap-3 group">
                  <span className="panel-title">Internships</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/40 text-indigo-200 border border-indigo-500/30">
                    {student.internships?.length || 0}
                  </span>
                  {showInternship ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate(`/add-internship/${student._id}`)}
                    className="glass px-5 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition"
                  >
                    <FaBriefcase className="text-sm" /> Add Internship
                  </button>
                )}
              </div>
              <div className="divider" />
              {showInternship && (
                <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2 scroll-thin">
                  {student.internships && student.internships.length > 0 ? (
                    student.internships.map((internship, index) => {
                      const statusColor = internship.status === 'Completed'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                        : internship.status === 'Ongoing'
                        ? 'bg-blue-600/30 text-blue-300 border-blue-500/30'
                        : internship.status === 'Terminated'
                        ? 'bg-red-600/30 text-red-300 border-red-500/30'
                        : 'bg-yellow-600/30 text-yellow-300 border-yellow-500/30';
                      return (
                        <div key={index} className="relative pl-6">
                          <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-indigo-400"></div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 transition">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <h3 className="text-lg font-semibold tracking-wide text-gray-100">{internship.company}</h3>
                              <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor}`}>{internship.status}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">
                              <span className="text-gray-400">Position:</span> {internship.position}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {new Date(internship.startDate).toLocaleDateString()} – {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'Present'}
                            </p>
                            {internship.stipend && (
                              <p className="text-sm mt-2"><span className="text-gray-400">Stipend:</span> <span className="font-medium text-indigo-200">₹{internship.stipend}/month</span></p>
                            )}
                            {internship.description && (
                              <p className="text-xs mt-3 leading-relaxed text-gray-400 border-l-2 border-indigo-500/40 pl-3">
                                {internship.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-sm">No Internship Records</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}