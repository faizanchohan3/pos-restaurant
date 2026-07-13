import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiMapPin, FiPhone, FiClock } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const Delivery = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    items: "",
    total: "",
  });

  useEffect(() => {
    document.title = "POS | Delivery Orders";
    if (shopId) fetchDeliveries();
  }, [shopId]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery?shopId=${shopId}`);
      const data = await res.json();
      if (data.success) setDeliveryOrders(data.data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      enqueueSnackbar("Failed to load deliveries", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address || !formData.items || !formData.total) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          items: parseInt(formData.items),
          total: parseFloat(formData.total),
          status: "Pending",
          shopId: parseInt(shopId),
        }),
      });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Delivery order created!", { variant: "success" });
        fetchDeliveries();
        setFormData({ customerName: "", phone: "", address: "", items: "", total: "" });
        setShowAddModal(false);
      } else {
        enqueueSnackbar(data.message || "Failed to create", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Status updated!", { variant: "success" });
        fetchDeliveries();
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        enqueueSnackbar("Order deleted!", { variant: "success" });
        fetchDeliveries();
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const statusColors = {
    "Pending": "bg-yellow-900 text-yellow-200",
    "In Transit": "bg-blue-900 text-blue-200",
    "Delivered": "bg-green-900 text-green-200",
    "Cancelled": "bg-red-900 text-red-200",
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Delivery Orders
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + New Delivery
        </button>
      </div>

      {/* Delivery Orders Grid */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        <div className="grid grid-cols-1 gap-4">
          {deliveryOrders.map((order) => (
            <div key={order.id} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-[#f5f5f5] font-bold text-lg">{order.customerName}</h3>
                  <div className="flex items-center gap-2 text-[#ababab] text-sm mt-1">
                    <FiPhone size={14} />
                    <span>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#ababab] text-sm mt-1">
                    <FiMapPin size={14} />
                    <span>{order.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-xl">PKR {order.total}</p>
                  <p className="text-[#ababab] text-sm">{order.items} items</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <FiClock size={14} className="text-[#ababab]" />
                <span className="text-[#ababab] text-sm">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                </span>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  className="flex-1 bg-[#1f1f1f] text-white px-3 py-2 rounded text-sm border border-[#383838] focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Delivery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-4">New Delivery Order</h2>
            <form onSubmit={handleAddDelivery}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Customer Name</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Enter customer name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Delivery Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter delivery address"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] h-20 resize-none"
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#ababab] text-sm mb-2 block">No. of Items</label>
                  <input
                    type="number"
                    value={formData.items}
                    onChange={(e) => setFormData({...formData, items: e.target.value})}
                    placeholder="0"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                  />
                </div>
                <div>
                  <label className="text-[#ababab] text-sm mb-2 block">Total Amount</label>
                  <input
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData({...formData, total: e.target.value})}
                    placeholder="0"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                  />
                </div>
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

export default Delivery;
