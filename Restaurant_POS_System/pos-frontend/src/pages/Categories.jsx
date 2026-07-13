import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const Categories = () => {
  const { user } = useSelector(state => state.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    document.title = "POS | Categories";
    if (shopId) {
      fetchCategories();
    }
  }, [shopId]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      enqueueSnackbar("Failed to load categories", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      enqueueSnackbar("Please enter category name", { variant: "warning" });
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/categories/${editingId}`
        : `${API_BASE_URL}/api/categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, shopId: parseInt(shopId) }),
      });
      const data = await res.json();

      if (data.success) {
        enqueueSnackbar(editingId ? "Category updated!" : "Category added!", { variant: "success" });
        fetchCategories();
        setShowAddModal(false);
        setEditingId(null);
        setFormData({ name: "", description: "" });
      } else {
        enqueueSnackbar(data.message || "Operation failed", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Category deleted!", { variant: "success" });
        fetchCategories();
      } else {
        enqueueSnackbar("Failed to delete", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleEditCategory = (category) => {
    setFormData({ name: category.name, description: category.description || "" });
    setEditingId(category.id);
    setShowAddModal(true);
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Product Categories
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", description: "" });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        {loading ? (
          <p className="text-center text-[#ababab] py-8">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-[#ababab] py-8">No categories yet. Click "Add Category" to create one.</p>
        ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-[#2a2a2a] rounded-lg p-5 border border-[#383838] hover:border-yellow-400 transition">
              <h3 className="text-[#f5f5f5] font-bold text-lg mb-2">{category.name}</h3>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <FiEdit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-md border border-[#383838] overflow-hidden">
            <div className="bg-[#2a2a2a] p-6 border-b border-[#383838]">
              <h2 className="text-white text-2xl font-bold">
                {editingId ? "✏️ Edit Category" : "➕ Add New Category"}
              </h2>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="text-[#ababab] text-sm mb-2 block font-semibold">📂 Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Appetizers, Main Course"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#383838]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="flex-1 bg-[#383838] hover:bg-[#484848] text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  ✕ Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold transition"
                >
                  {editingId ? "✓ Update Category" : "➕ Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Categories;
