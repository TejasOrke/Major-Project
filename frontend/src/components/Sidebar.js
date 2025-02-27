import { Link } from "react-router-dom";
import { FaHome, FaUserGraduate, FaBriefcase, FaFileAlt } from "react-icons/fa";

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform duration-300 ease-in-out shadow-lg`}
    >
      {/* Sidebar Header - Fixed Spacing Issue */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="mr-2">🎓</span> College Portal
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="text-purple-400 hover:text-white text-2xl transition-all"
        >
          ✖
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col mt-4">
        <Link to="/dashboard" className="sidebar-link">
          <FaHome className="sidebar-icon" /> <span>Dashboard</span>
        </Link>
        <Link to="/students" className="sidebar-link">
          <FaUserGraduate className="sidebar-icon" /> <span>Students</span>
        </Link>
        <Link to="/lors" className="sidebar-link">
          <FaBriefcase className="sidebar-icon" /> <span>LORs</span>
        </Link>
      </nav>
    </div>
  );
}
