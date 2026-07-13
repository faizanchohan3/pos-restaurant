import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Stock = () => {
  const { user } = useSelector(state => state.user);

  // Check if user is admin
  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }
  const [stockItems, setStockItems] = useState([
    { id: 1, name: "Chicken Tikka", quantity: 50, unit: "kg", minLevel: 10 },
    { id: 2, name: "Basmati Rice", quantity: 100, unit: "kg", minLevel: 20 },
    { id: 3, name: "Dal", quantity: 30, unit: "kg", minLevel: 5 },
    { id: 4, name: "Oil", quantity: 20, unit: "liter", minLevel: 5 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", quantity: "", unit: "kg", minLevel: "" });

  useEffect(() => {
    document.title = "POS | Stock";
  }, []);

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.minLevel) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    const newItem = {
      id: Math.max(...stockItems.map(i => i.id), 0) + 1,
      name: formData.name,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      minLevel: parseInt(formData.minLevel),
    };
    setStockItems([...stockItems, newItem]);
    setFormData({ name: "", quantity: "", unit: "kg", minLevel: "" });
    setShowAddModal(false);
    enqueueSnackbar("Stock item added!", { variant: "success" });
  };

  const handleUpdateQuantity = (id, change) => {
    setStockItems(stockItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
    ));
  };

  const handleDeleteItem = (id) => {
    setStockItems(stockItems.filter(item => item.id !== id));
    enqueueSnackbar("Item deleted!", { variant: "success" });
  };

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minLevel);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Stock Management
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Stock
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mx-10 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg mb-4">
          <p className="text-red-400 font-semibold">⚠️ Low Stock Alert!</p>
          <p className="text-[#ababab] text-sm">
            {lowStockItems.map(i => i.name).join(", ")} are running low
          </p>
        </div>
      )}

      {/* Stock Table */}
      <div className="flex-1 overflow-auto px-10 mb-4">
        <table className="w-full text-left text-[#ababab]">
          <thead className="sticky top-0 bg-[#2a2a2a]">
            <tr className="border-b border-[#383838]">
              <th className="px-4 py-3 text-[#f5f5f5]">Item Name</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Quantity</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Unit</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Min Level</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item) => (
              <tr key={item.id} className="border-b border-[#383838] hover:bg-[#2a2a2a]">
                <td className="px-4 py-3 text-[#f5f5f5]">{item.name}</td>
                <td className={`px-4 py-3 font-semibold ${item.quantity <= item.minLevel ? "text-red-400" : "text-green-400"}`}>
                  {item.quantity}
                </td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className="px-4 py-3">{item.minLevel}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, -5)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                    title="Decrease"
                  >
                    <FiMinus size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, 5)}
                    className="bg-green-600 hover:bg-green-700 p-2 rounded text-white"
                    title="Increase"
                  >
                    <FiPlus size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded text-white"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96">
            <h2 className="text-white text-xl font-bold mb-4">Add Stock Item</h2>
            <form onSubmit={handleAddStock}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter item name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                >
                  <option value="kg">kg</option>
                  <option value="gram">gram</option>
                  <option value="liter">liter</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Minimum Level</label>
                <input
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => setFormData({...formData, minLevel: e.target.value})}
                  placeholder="Enter minimum level"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500"
                >
                  Add Item
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

export default Stock;
