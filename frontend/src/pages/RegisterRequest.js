import { useState } from "react";
import {requestRegister} from "../api/api";

export default function RegisterRequest() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleRequest = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
    
        try {
            const response = await requestRegister({ email });
            setMessage(response.data.message);
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.message === "User already exists") {
                setError("This email is already registered.");
            } else {
                setError(err.response?.data?.message || "Something went wrong");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-4">Request Access</h2>
                {message && <p className="text-green-400">{message}</p>}
                {error && <p className="text-red-400">{error}</p>}
                <form onSubmit={handleRequest}>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full mb-3 p-2 border rounded text-black" 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded transition"
                    >
                        Request Access
                    </button>
                </form>
            </div>
        </div>
    );
}
