import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import { printReport } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const Stock = () => {
  const shopId = localStorage.getItem("selectedShop");

  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", quantity: "", unit: "kg", minLevel: "" });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | low | ok

  useEffect(() => {
    document.title = "POS | Stock";
    if (shopId) fetchStock();
  }, [shopId]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setStockItems(data.data);
    } catch (error) {
      console.error("Error fetching stock:", error);
      enqueueSnackbar("Failed to load stock", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.minLevel) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          minLevel: parseFloat(formData.minLevel),
          shopId: parseInt(shopId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Stock item added!", { variant: "success" });
        fetchStock();
        setFormData({ name: "", quantity: "", unit: "kg", minLevel: "" });
        setShowAddModal(false);
      } else {
        enqueueSnackbar(data.message || "Failed to add", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleUpdateQuantity = async (item, change) => {
    const newQty = Math.max(0, (item.quantity || 0) + change);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) fetchStock();
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Item deleted!", { variant: "success" });
        fetchStock();
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const lowStockItems = stockItems.filter(item => item.quantity <= item.minLevel);

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const isLow = item.quantity <= item.minLevel;
    const matchesFilter =
      filter === "all" || (filter === "low" && isLow) || (filter === "ok" && !isLow);
    return matchesSearch && matchesFilter;
  });

  const handlePrint = () => {
    const shopName = (() => {
      try {
        return JSON.parse(localStorage.getItem("shopSession"))?.name || "Stock Report";
      } catch {
        return "Stock Report";
      }
    })();

    const rows = filteredItems
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td class="right">${item.quantity}</td>
          <td>${item.unit}</td>
          <td class="right">${item.minLevel}</td>
          <td>${item.quantity <= item.minLevel ? "LOW STOCK" : "OK"}</td>
        </tr>`
      )
      .join("");

    const table = `
      <table>
        <thead>
          <tr><th>Item Name</th><th class="right">Quantity</th><th>Unit</th><th class="right">Min Level</th><th>Status</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5" class="center">No items</td></tr>'}</tbody>
        <tfoot>
          <tr><td colspan="5">Total items: ${filteredItems.length} &nbsp; | &nbsp; Low stock: ${filteredItems.filter((i) => i.quantity <= i.minLevel).length}</td></tr>
        </tfoot>
      </table>`;

    printReport(`${shopName} — Stock Report`, `Filter: ${filter.toUpperCase()}`, table);
  };

  return (
    <section className="bg-[#1f1f1f] min-h-screen overflow-auto flex flex-col pb-10">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Stock Management
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#2e4a40] text-[#02ca3a] px-4 py-2 rounded-lg font-bold hover:bg-[#345c4d]"
          >
            <FaPrint size={16} /> Print
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-10 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search item..."
          className="bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm w-64"
        />
        {[
          { key: "all", label: "All" },
          { key: "low", label: "Low Stock" },
          { key: "ok", label: "In Stock" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm font-semibold rounded-lg px-4 py-2 ${
              filter === f.key ? "bg-[#383838] text-white" : "text-[#ababab]"
            }`}
          >
            {f.label}
          </button>
        ))}
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
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-[#ababab]">Loading...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-[#ababab]">No stock items match.</td></tr>
            ) : filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-[#383838] hover:bg-[#2a2a2a]">
                <td className="px-4 py-3 text-[#f5f5f5]">{item.name}</td>
                <td className={`px-4 py-3 font-semibold ${item.quantity <= item.minLevel ? "text-red-400" : "text-green-400"}`}>
                  {item.quantity}
                </td>
                <td className="px-4 py-3">{item.unit}</td>
                <td className="px-4 py-3">{item.minLevel}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item, -5)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                    title="Decrease"
                  >
                    <FiMinus size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateQuantity(item, 5)}
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
    </section>
  );
};

export default Stock;
