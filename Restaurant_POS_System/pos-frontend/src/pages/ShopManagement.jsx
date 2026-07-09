import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ShopManagement = () => {
  const { user } = useSelector(state => state.user);
  const [shops, setShops] = useState([
    { id: 1, name: "Main Branch", location: "Downtown", phone: "9876543210", email: "main@restaurant.com", manager: "Raj Kumar" },
    { id: 2, name: "Mall Branch", location: "Shopping Mall", phone: "9876543211", email: "mall@restaurant.com", manager: "Priya Singh" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    email: "",
    manager: "",
  });

  useEffect(() => {
    document.title = "POS | Shop Management";
  }, []);

  // Check if user is admin
  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }

  const handleAddShop = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.phone) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }

    if (editingId) {
      setShops(shops.map(s => s.id === editingId ? { ...s, ...formData, id: editingId } : s));
      enqueueSnackbar("Shop updated!", { variant: "success" });
      setEditingId(null);
    } else {
      const newShop = {
        id: Math.max(...shops.map(s => s.id), 0) + 1,
        ...formData,
      };
      setShops([...shops, newShop]);
      enqueueSnackbar("Shop added!", { variant: "success" });
    }

    setFormData({ name: "", location: "", phone: "", email: "", manager: "" });
    setShowAddModal(false);
  };

  const handleDeleteShop = (id) => {
    setShops(shops.filter(s => s.id !== id));
    enqueueSnackbar("Shop deleted!", { variant: "success" });
  };

  const handleEditShop = (shop) => {
    setFormData(shop);
    setEditingId(shop.id);
    setShowAddModal(true);
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Shop Management
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", location: "", phone: "", email: "", manager: "" });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Shop
        </button>
      </div>

      {/* Summary Card */}
      <div className="px-10 mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Total Shops</p>
              <p className="text-white text-2xl font-bold">{shops.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Active Locations</p>
              <p className="text-yellow-400 text-2xl font-bold">{shops.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-[#2a2a2a] rounded-lg p-5 border border-[#383838] hover:border-yellow-400 transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[#f5f5f5] font-bold text-lg">{shop.name}</h3>
                  <p className="text-[#ababab] text-sm">📍 {shop.location}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-[#ababab]">
                  <span className="font-semibold">Manager:</span> {shop.manager}
                </p>
                <p className="text-[#ababab]">
                  <span className="font-semibold">Phone:</span> {shop.phone}
                </p>
                <p className="text-[#ababab]">
                  <span className="font-semibold">Email:</span> {shop.email}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditShop(shop)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <FiEdit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteShop(shop.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-semibold flex items-center justify-center gap-2"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Shop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-4">
              {editingId ? "Edit Shop" : "Add New Shop"}
            </h2>
            <form onSubmit={handleAddShop}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Shop Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter shop name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter location"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Manager Name</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  placeholder="Enter manager name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
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

export default ShopManagement;
