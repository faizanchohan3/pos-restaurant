import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Categories = () => {
  const { user } = useSelector(state => state.user);
  const [categories, setCategories] = useState([
    { id: 1, name: "Appetizers", description: "Starters and snacks", shop_id: 1 },
    { id: 2, name: "Main Course", description: "Main dishes", shop_id: 1 },
    { id: 3, name: "Desserts", description: "Sweet dishes", shop_id: 1 },
    { id: 4, name: "Beverages", description: "Drinks", shop_id: 1 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    document.title = "POS | Categories";
  }, []);

  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!formData.name) {
      enqueueSnackbar("Please enter category name", { variant: "warning" });
      return;
    }

    if (editingId) {
      setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData, id: editingId } : c));
      enqueueSnackbar("Category updated!", { variant: "success" });
      setEditingId(null);
    } else {
      const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        ...formData,
        shop_id: 1, // Current shop
      };
      setCategories([...categories, newCategory]);
      enqueueSnackbar("Category added!", { variant: "success" });
    }

    setFormData({ name: "", description: "" });
    setShowAddModal(false);
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    enqueueSnackbar("Category deleted!", { variant: "success" });
  };

  const handleEditCategory = (category) => {
    setFormData(category);
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
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-[#2a2a2a] rounded-lg p-5 border border-[#383838] hover:border-yellow-400 transition">
              <h3 className="text-[#f5f5f5] font-bold text-lg mb-2">{category.name}</h3>
              <p className="text-[#ababab] text-sm mb-4">{category.description}</p>

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
      </div>

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96">
            <h2 className="text-white text-xl font-bold mb-4">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Appetizers, Main Course"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter category description"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] h-20 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default Categories;
