import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getStudentById, generateSmartLOR, getLORRecommendations } from '../api';
import { FaUserGraduate, FaRobot, FaMagic, FaFileAlt, FaSpinner } from 'react-icons/fa';

export default function SmartLORGenerator() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    purpose: '',
    university: '',
    program: '',
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchStudentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStudentById(studentId);
      const raw = response.data;
      const normalized = {
        ...raw,
        departmentObj: raw.department && typeof raw.department === 'object' ? raw.department : null,
        departmentName: typeof raw.department === 'string' ? raw.department : (raw.department?.name || 'N/A'),
        cgpa: raw.cgpa !== undefined ? raw.cgpa : 'N/A',
        skills: Array.isArray(raw.skills) ? raw.skills : []
      };
      setStudent(normalized);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to load student details");
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const analyzeStudent = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      const response = await getLORRecommendations(studentId);
      const recs = response.data.analysis?.recommendations || response.data.recommendations || [];
      setRecommendations(recs);
      setAnalyzing(false);
    } catch (err) {
      console.error("Error analyzing student data:", err);
      if (err.message === 'Network Error') {
        setError("Network error: Please check your connection or server status");
      } else if (err.response) {
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else {
        setError("Failed to analyze student data. Please try again later.");
      }
      setAnalyzing(false);
    }
  };

  const handleGenerateLOR = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      if (!formData.purpose || !formData.university || !formData.program) {
        setError("Please fill all required fields");
        setGenerating(false);
        return;
      }
      const response = await generateSmartLOR({
        studentId,
        purpose: formData.purpose,
        university: formData.university,
        program: formData.program,
        save: false
      });
      console.log('[LOR] Generation response', response.data);
      if (response.data && response.data.generatedContent) {
        setGeneratedContent(response.data.generatedContent);
      } else {
        setError('Generation returned no content');
      }
      setTimeout(() => {
        const el = document.getElementById('generated-lor');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      setGenerating(false);
    } catch (err) {
      console.error("Error generating LOR:", err);
      if (err.response && err.response.data && err.response.data.generatedContent) {
        setGeneratedContent(err.response.data.generatedContent);
      } else if (err.message === 'Network Error') {
        setError('Network error: Please check your connection and try again');
      } else if (err.response) {
        const serverMessage = err.response.data.message || err.response.statusText;
        setError(`Server error: ${serverMessage}`);
      } else {
        setError('Failed to generate LOR. Please try again later.');
      }
      setGenerating(false);
    }
  };
  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6 flex justify-center items-center h-full">
            <p className="text-xl">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-600 text-white p-4 rounded-lg">{error}</div>
            <button 
              onClick={() => navigate('/students')} 
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">AI-Powered LOR Generator</h1>
              <p className="text-sm text-gray-400 mt-1">Generate context-aware Letters of Recommendation enhanced by AI insights.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => navigate(`/student/${studentId}`)} 
                className="px-4 py-2 rounded-lg bg-gray-700/60 hover:bg-gray-600/60 backdrop-blur-md border border-gray-600/40 shadow-sm text-sm transition"
              >Back to Profile</button>
              <button 
                onClick={analyzeStudent}
                disabled={analyzing}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition border backdrop-blur-md ${analyzing ? 'bg-gray-600/50 border-gray-500 cursor-not-allowed' : 'bg-indigo-600/80 hover:bg-indigo-500 border-indigo-400/40'}`}
              >{analyzing ? <><FaSpinner className="animate-spin" />Analyzing...</> : <><FaRobot />Analyze</>}</button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/40 bg-red-700/30 backdrop-blur-md px-4 py-3 text-sm flex items-start gap-3">
              <span className="mt-0.5">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_18rem] gap-6 items-start">
            {/* Main Content Column */}
            <div className="space-y-6">
              {/* Student + Form in responsive grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Student Info Panel */}
                <div className="relative group rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-6 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaUserGraduate /> <span>Student Profile</span></h2>
                  <div className="space-y-3 text-sm">
                    <InfoRow label="Name" value={student?.name} />
                    <InfoRow label="Roll No" value={student?.rollNo} />
                    <InfoRow label="Department" value={student?.departmentName || 'N/A'} />
                    <InfoRow label="CGPA" value={student?.cgpa || 'N/A'} />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student?.skills?.length ? student.skills.map((s,i)=>(<span key={i} className="px-2 py-1 text-[10px] rounded-md bg-gradient-to-r from-indigo-600/60 to-purple-600/60 border border-indigo-400/30 text-indigo-50">{s}</span>)) : <span className="text-gray-500 text-xs">No skills</span>}
                      </div>
                    </div>
                  </div>
                  {recommendations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge>{recommendations.length} recs</Badge>
                    </div>
                  )}
                </div>

                {/* LOR Generation Form */}
                <div className="relative group rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-6 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-tr from-green-500/10 via-emerald-500/10 to-teal-500/10" />
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaFileAlt /> <span>Generation Parameters</span></h2>
                  <form onSubmit={handleGenerateLOR} className="space-y-4 text-sm">
                    <SelectField label="Purpose" name="purpose" value={formData.purpose} onChange={handleChange} options={["Graduate School","PhD Program","Job Application","Scholarship","Internship","Research Position"]} />
                    <InputField label="University / Organization" name="university" value={formData.university} onChange={handleChange} placeholder="e.g., Stanford University" />
                    <InputField label="Program / Position" name="program" value={formData.program} onChange={handleChange} placeholder="e.g., MS in Computer Science" />
                    <button type="submit" disabled={generating} className={`w-full rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition shadow border ${generating ? 'bg-gray-600/50 border-gray-500 cursor-not-allowed' : 'bg-green-600/80 hover:bg-green-500 border-green-400/40'}`}>{generating ? <><FaSpinner className="animate-spin" />Generating...</> : <><FaMagic />Generate Smart LOR</>}</button>
                  </form>
                </div>
              </div>

              {/* Generated LOR */}
              {generatedContent && (
                <div id="generated-lor" className="relative group rounded-2xl border border-gray-600/40 bg-gray-900/60 backdrop-blur-xl p-6 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><FaFileAlt /> <span>Generated Letter</span></h2>
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="px-3 py-1.5 rounded-md text-xs bg-blue-600/80 hover:bg-blue-500 border border-blue-400/40 shadow-sm transition">{copied ? 'Copied!' : 'Copy'}</button>
                      <a href="#top" className="px-3 py-1.5 rounded-md text-xs bg-gray-700/60 hover:bg-gray-600/60 border border-gray-500/40 shadow-sm transition">Top</a>
                    </div>
                  </div>
                  <div className="relative text-sm leading-relaxed max-h-[600px] overflow-y-auto pr-2 custom-scroll">
                    <pre className="whitespace-pre-wrap font-sans text-[13px] tracking-wide">{generatedContent}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Rail */}
            <div className="hidden xl:block">
              <div className="sticky top-32 space-y-6">
                <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 shadow-lg">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300 mb-3 flex items-center gap-2"><FaRobot className="text-indigo-400" /> AI Recommendations</h3>
                  {recommendations.length ? (
                    <div className="space-y-3">
                      {recommendations.map((rec,i)=>
                        <div key={i} className="group/item rounded-lg border border-gray-600/30 bg-gray-700/40 p-3 hover:border-indigo-400/40 transition">
                          <p className="text-xs font-medium text-indigo-300 mb-1 flex items-center justify-between"><span>{rec.area}</span><span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/40 border border-indigo-400/20">{rec.templateType}</span></p>
                          <p className="text-[11px] text-gray-300 leading-snug">{rec.suggestion}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-6 flex flex-col items-center text-center">
                      <FaRobot className="text-3xl text-gray-600 mb-3" />
                      {analyzing ? 'Analyzing student data...' : 'Run Analyze to view tailored strengthening suggestions.'}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-600/40 bg-gradient-to-br from-indigo-800/40 via-purple-800/30 to-fuchsia-800/30 backdrop-blur-xl p-5 shadow-lg">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200 mb-4">Tips for Strong LOR</h3>
                  <ul className="space-y-3 text-[11px] text-gray-300">
                    <li className="leading-snug">Be specific about the student's achievements and quantify impact when possible.</li>
                    <li className="leading-snug">Highlight growth, consistency, and unique traits (initiative, leadership, research rigor).</li>
                    <li className="leading-snug">Align strengths with program focus (research fit, analytical depth, teamwork, innovation).</li>
                    <li className="leading-snug">Keep tone professional, authentic, and supportive—avoid generic praise.</li>
                  </ul>
                </div>

                {!generatedContent && (
                  <div className="rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-xl p-5 shadow-lg text-[11px] text-gray-300">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-200 mb-3">Workflow</h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Review student profile data.</li>
                      <li>Click Analyze for AI recommendations.</li>
                      <li>Fill generation parameters.</li>
                      <li>Generate and refine the letter.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Small presentational helpers ---
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function Badge({ children }) {
  return <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-600/40 border border-indigo-400/30 text-indigo-100 tracking-wide">{children}</span>;
}

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 tracking-wide text-gray-300">{label}</label>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder} required className="w-full rounded-md px-3 py-2 bg-gray-900/60 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-gray-500" />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 tracking-wide text-gray-300">{label}</label>
      <select name={name} value={value} onChange={onChange} required className="w-full rounded-md px-3 py-2 bg-gray-900/60 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}