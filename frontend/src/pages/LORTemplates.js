// pages/LORTemplates.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from "../api/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function LORTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isDefault: false
  });
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (!storedUser || (storedUser.role !== "admin" && storedUser.role !== "faculty")) {
      navigate("/dashboard");
      return;
    }

    fetchTemplates();
  }, [navigate]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getAllTemplates();
      setTemplates(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, formData);
      } else {
        await createTemplate(formData);
      }
      
      fetchTemplates();
      resetForm();
    } catch (err) {
      setError("Error saving template");
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      isDefault: template.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id);
        fetchTemplates();
      } catch (err) {
        setError("Error deleting template");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      isDefault: false
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">LOR Templates</h1>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              {showForm ? "Cancel" : <><FaPlus className="mr-2" /> Create Template</>}
            </button>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <div className="mb-2 text-xs text-gray-400">
                    Use placeholders like {'{name}'}, {'{department}'}, etc. for student data
                  </div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={15}
                    className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>

                {user?.role === "admin" && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                      id="isDefault"
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium">
                      Set as default template (available to all users)
                    </label>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    {editingTemplate ? "Update Template" : "Save Template"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-semibold truncate">{template.title}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <FaEdit />
                        </button>
                        {(template.createdBy?._id === user?.id || user?.role === "admin") && (
                          <button
                            onClick={() => handleDelete(template._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        {template.isDefault ? (
                          <span className="bg-purple-800 text-xs px-2 py-1 rounded">Default Template</span>
                        ) : (
                          <span>Created by: {template.createdBy?.name || "Unknown"}</span>
                        )}
                      </div>
                      <div className="h-32 overflow-hidden text-gray-300 text-sm">
                        <p className="line-clamp-6">{template.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-10 bg-gray-800 rounded-lg">
                  <p>No templates found. Create your first template!</p>
                </div>
              )}
            </div>
          )}
          
          {!loading && templates.length > 0 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Available Placeholders</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{name}"}</code> - Student's name
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{rollNo}"}</code> - Roll number
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{department}"}</code> - Department
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{cgpa}"}</code> - CGPA
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{skills}"}</code> - Skills
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{achievements}"}</code> - Achievements
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{university}"}</code> - Target university
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{program}"}</code> - Target program
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{purpose}"}</code> - LOR purpose
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{facultyName}"}</code> - Your name
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{facultyDepartment}"}</code> - Your dept
                </div>
                <div className="bg-gray-700 p-2 rounded text-sm">
                  <code className="text-green-400">{"{date}"}</code> - Current date
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}