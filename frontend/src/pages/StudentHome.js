import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getStudents } from "../api";

const PROGRAMS = [
  {
    type: "UG",
    label: "Undergraduate Programmes",
    options: [
      "B.Tech. Computer Engineering",
      "B.Tech. Electronics and Telecommunication Engineering",
      "B.Tech. Computer Science And Engineering",
    ],
  },
  {
    type: "PG",
    label: "Postgraduate Programmes",
    options: [
      "Master of Computer Applications",
      "M.Tech. (Electronics & Telecommunication)",
      "M.Tech. (Computer Engineering)",
    ],
  },
];

export default function StudentHome() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data } = await getStudents();
        setStudents(data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Normalize program names for accurate counting
  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, " ").trim();

  // totalStudents already declared above, so remove duplicate
  const programCounts = {};

  PROGRAMS.forEach((group) => {
    group.options.forEach((prog) => {
      programCounts[prog] = students.filter(
        (s) => normalize(s.program) === normalize(prog)
      ).length;
    });
  });

  const totalStudents = students.length;
  const recentStudents = students.slice(-4).reverse();
  const programStats = PROGRAMS.flatMap((group) =>
    group.options.map((prog) => ({
      program: prog,
      count: programCounts[prog],
    }))
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 p-8 flex flex-col items-center gap-8">
          {/* Welcome Section */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <img
              src="https://www.spit.ac.in/wp-content/uploads/2021/01/LogoSPIT.png"
              alt="College Logo"
              className="w-24 h-24 mb-2 drop-shadow-lg rounded-full bg-white"
            />
            <h1 className="text-4xl font-extrabold text-center drop-shadow mb-2">
              Welcome to the Student Portal
            </h1>
            <p className="text-lg text-gray-300 text-center max-w-2xl mb-2">
              Your gateway to academic records, achievements, and opportunities.
              Explore your programme, connect with peers, and stay updated with
              the latest campus happenings.
            </p>
          </div>

          {/* Quick Info Cards: Per-program counts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-400 mb-2">
                {totalStudents}
              </span>
              <span className="text-lg font-semibold text-gray-200">
                Total Students
              </span>
            </div>
            {programStats.map(({ program, count }) => (
              <div
                key={program}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 flex flex-col items-center"
              >
                <span className="text-3xl font-bold text-purple-400 mb-2">
                  {count}
                </span>
                <span className="text-lg font-semibold text-gray-200 text-center">
                  {program}
                </span>
              </div>
            ))}
          </div>

          {/* Programmes Section */}
          <div className="flex flex-col gap-6 w-full max-w-2xl">
            {PROGRAMS.map((group) => (
              <div
                key={group.type}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-200">
                  {group.label}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.options.map((prog) => (
                    <li
                      key={prog}
                      className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow"
                    >
                      <span className="font-semibold text-gray-100">
                        {prog}
                      </span>
                      <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                        {loading ? "..." : programCounts[prog]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Recent Students Section */}
          <div className="w-full max-w-2xl mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-200">
              Recently Added Students
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div
                    key={student._id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow flex flex-col gap-2"
                  >
                    <span className="text-lg font-bold text-blue-300">
                      {student.name}
                    </span>
                    <span className="text-sm text-gray-300">
                      {student.program}
                    </span>
                    <span className="text-sm text-gray-400">
                      Roll No: {student.rollNo}
                    </span>
                    <span className="text-sm text-gray-400">
                      Semester: {student.semester}
                    </span>
                    <span className="text-sm text-gray-400">
                      Email: {student.email}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 p-4">No students added yet.</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-6 mt-8">
            <Link
              to="/add-student"
              className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold shadow-lg hover:bg-blue-800 transition-all duration-200 text-center border border-gray-700"
            >
              Add Student
            </Link>
            <Link
              to="/students"
              className="px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold shadow-lg hover:bg-gray-900 transition-all duration-200 text-center border border-gray-700"
            >
              View Student List
            </Link>
          </div>

          {/* Motivational Quote */}
          <div className="mt-10 text-center text-lg italic text-gray-400 max-w-2xl">
            "Education is the most powerful weapon which you can use to change
            the world." <br />
            <span className="text-gray-500">- Nelson Mandela</span>
          </div>
        </div>
        {/* Footer */}
        <footer className="w-full py-4 bg-gray-900 border-t border-gray-800 text-center text-gray-400 text-sm mt-auto">
          &copy; {new Date().getFullYear()} College Doc Tracker &mdash;
          Empowering Students for Success
        </footer>
      </div>
    </div>
  );
}
