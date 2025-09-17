import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getLORById } from '../api';
import { FaFileAlt, FaUser, FaBuilding, FaGraduationCap, FaCalendar } from 'react-icons/fa';

export default function LORDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lor, setLor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLORDetails();
  }, [id]);

  const fetchLORDetails = async () => {
    try {
      setLoading(true);
      // This API function needs to be implemented in your api.js
      const response = await getLORById(id);
      setLor(response.data);
    } catch (err) {
      console.error("Error fetching LOR details:", err);
      setError("Failed to load LOR details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6 flex justify-center items-center h-full">
            <p className="text-xl">Loading LOR details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Sidebar />
        <div className="w-full">
          <Navbar />
          <div className="p-6">
            <div className="bg-red-600 text-white p-4 rounded-lg">{error}</div>
            <button 
              onClick={() => navigate('/lors')} 
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to LORs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This is a basic placeholder - replace with actual data when available
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Letter of Recommendation Details</h1>
            <button 
              onClick={() => navigate('/lors')} 
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to LORs
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaFileAlt className="mr-2" /> Request Information
            </h2>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-400 mb-1">
                  <FaUser className="mr-2" /> Student
                </div>
                <p className="font-medium">{lor?.student?.name || 'N/A'}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-400 mb-1">
                  <FaBuilding className="mr-2" /> University
                </div>
                <p>{lor?.university || 'N/A'}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-400 mb-1">
                  <FaGraduationCap className="mr-2" /> Program
                </div>
                <p>{lor?.program || 'N/A'}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-400 mb-1">
                  <FaCalendar className="mr-2" /> Deadline
                </div>
                <p>{lor?.deadline ? new Date(lor.deadline).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 mb-1">Purpose</div>
              <p className="bg-gray-700 p-3 rounded">{lor?.purpose || 'N/A'}</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Status</h3>
              <div className={`px-4 py-2 rounded inline-block ${
                lor?.status === 'pending' ? 'bg-yellow-600' : 
                lor?.status === 'approved' ? 'bg-blue-600' : 
                lor?.status === 'completed' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {lor?.status ? lor.status.charAt(0).toUpperCase() + lor.status.slice(1) : 'N/A'}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              * LOR generation features are being implemented. Check back soon for more functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}