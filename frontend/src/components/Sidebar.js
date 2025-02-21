import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <ul>
        <li className="mb-2"><Link to="/dashboard" className="hover:text-blue-300">Home</Link></li>
        <li className="mb-2"><Link to="/students" className="hover:text-blue-300">Students</Link></li>
        <li className="mb-2"><Link to="/lors" className="hover:text-blue-300">LORs</Link></li>
      </ul>
    </div>
  );
}
