import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });

      console.log("Login response:", data);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      console.log("Stored user:", localStorage.getItem("user"));
      console.log("Stored token:", localStorage.getItem("token"));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-700 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-700 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg shadow-md transition-all transform hover:scale-105"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </form>

        {/* Register Button */}
        <div className="text-center mt-4">
          <p className="text-gray-400">Don't have an account?</p>
          <button
            onClick={() => navigate("/register-request")}
            className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
}
