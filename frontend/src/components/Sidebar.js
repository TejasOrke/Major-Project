import { Link } from "react-router-dom";
import { FaHome, FaUserGraduate, FaBriefcase } from "react-icons/fa";

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 theme-sidebar text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform duration-300 ease-in-out shadow-lg`}
    >
      {/* Sidebar Header - Fixed Spacing Issue */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-gray-100">
          <span className="text-xl">🎓</span>
          <span className="text-gray-200">Portal</span>
        </h1>
        <button
          onClick={() => setIsOpen(false)}
          className="text-indigo-300 hover:text-white text-xl transition-all"
        >
          ✖
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex flex-col mt-4 text-sm font-medium">
        <SidebarLink to="/dashboard" icon={<FaHome />}>Dashboard</SidebarLink>
        <SidebarLink to="/students" icon={<FaUserGraduate />}>Students</SidebarLink>
        <SidebarLink to="/lors" icon={<FaBriefcase />}>LORs</SidebarLink>
      </nav>
    </div>
  );
}

function SidebarLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition relative group"
    >
      <span className="text-lg opacity-90 group-hover:opacity-100">{icon}</span>
      <span className="tracking-wide text-sm font-medium">{children}</span>
      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition" />
    </Link>
  );
}
