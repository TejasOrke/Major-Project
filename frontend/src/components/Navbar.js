import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="text-lg font-bold">College Doc Tracker</h1>
      <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
    </nav>
  );
}
