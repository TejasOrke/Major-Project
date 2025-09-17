import { useState, useEffect, useRef } from "react";
import { FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi"; // Added user icon
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    const handler = (e) => {
      if (openUserMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openUserMenu]);

  // Toggle root class for layout shift when sidebar open (desktop)
  useEffect(() => {
    const root = document.documentElement;
    if (isSidebarOpen) {
      root.classList.add('sidebar-open');
    } else {
      root.classList.remove('sidebar-open');
    }
  }, [isSidebarOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpenUserMenu(false);
    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
  <nav className="relative px-5 py-3 flex items-center justify-between text-white rounded-b-2xl">
          <div className="absolute inset-0 -z-10 rounded-b-2xl overflow-hidden pointer-events-none">
            {/* Glass background */}
            <div className="absolute inset-0 backdrop-blur-xl bg-[rgba(15,23,42,0.55)] border-b border-white/10" />
            {/* Subtle accent edge */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 opacity-70" />
            {/* Soft light blobs */}
            <div className="absolute -top-12 left-1/3 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute top-0 -right-10 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl" />
          </div>
        
          <div className="relative flex items-center gap-4 z-10">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-2xl p-2 rounded-lg bg-white/5 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-indigo-300/40"
            >
              {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            {/* Brand */}
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-3 select-none">
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-sm">College Doc Tracker</span>
              <span className="hidden md:inline badge-admin">ADMIN</span>
            </h1>
          </div>
          {/* Right Section */}
          <div className="relative flex items-center gap-4 z-10" ref={menuRef}>
            {/* Placeholder for future search / actions */}
            {/* <div className="hidden md:block"><input className="bg-white/10 focus:bg-white/15 transition rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300/40 placeholder-gray-300" placeholder="Search..." /></div> */}
            <button
              onClick={() => setOpenUserMenu(o => !o)}
              className="group flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-300/40"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold shadow ring-1 ring-white/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-gray-900" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight text-left">
                <span className="text-[11px] uppercase tracking-wider text-gray-300">Signed in as</span>
                <span className="text-sm font-medium max-w-[120px] truncate">{user?.name || 'Admin'}</span>
              </div>
              <span className={`text-xs transition-transform duration-300 ${openUserMenu ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-52 rounded-xl p-2 bg-[rgba(17,24,39,0.9)] backdrop-blur-xl border border-white/10 shadow-2xl animate-fade-in z-50">
                <div className="px-3 py-2 mb-1 rounded-lg bg-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
                  </div>
                  <div className="text-xs">
                    <p className="font-medium text-white truncate max-w-[120px]">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Account</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-md hover:bg-white/10 text-sm transition"
                >
                  <FiLogOut className="opacity-80" /> Logout
                </button>
              </div>
            )}
          </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}
