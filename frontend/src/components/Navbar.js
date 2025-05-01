import { useState } from "react";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi"; // Menu, Close, and Logout icons
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 p-3 text-white flex justify-between items-center shadow-md rounded-b-lg">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white text-3xl hover:scale-110 transition-transform"
        >
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Title */}
        <h1 className="text-lg font-bold tracking-wide">📄 College Doc Tracker</h1>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition-all transform hover:scale-105"
        >
          <FiLogOut className="mr-2 text-lg" />
          Logout
        </button>
      </nav>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}
