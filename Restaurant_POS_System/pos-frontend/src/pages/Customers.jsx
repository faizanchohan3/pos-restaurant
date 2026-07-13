import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../https";

const Customers = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  useEffect(() => {
    document.title = "POS | Customers";
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await getCustomers(shopId);
      if (res.data.success) setCustomers(res.data.data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch customers", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditing(customer);
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    } else {
      setEditing(null);
      setForm({ name: "", phone: "", email: "", address: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ name: "", phone: "", email: "", address: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shopId) {
      enqueueSnackbar("No shop selected. Please log in again.", { variant: "error" });
      return;
    }
    if (!form.name) {
      enqueueSnackbar("Customer name is required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        const res = await updateCustomer({ customerId: editing.id, ...form });
        if (res.data.success) {
          enqueueSnackbar("Customer updated!", { variant: "success" });
        }
      } else {
        const res = await addCustomer({ ...form, shopId: parseInt(shopId) });
        if (res.data.success) {
          enqueueSnackbar("Customer added!", { variant: "success" });
        }
      }
      fetchCustomers();
      closeModal();
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to save customer",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    setLoading(true);
    try {
      const res = await deleteCustomer(id);
      if (res.data.success) {
        enqueueSnackbar("Customer deleted!", { variant: "success" });
        fetchCustomers();
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete customer", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">👤 Customers</h1>
              <p className="text-[#ababab]">Manage your shop's customers</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition"
          >
            <FiPlus size={20} /> Add Customer
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500"
          />
        </div>

        {loading && !showModal ? (
          <div className="text-center text-[#ababab] py-8">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-8 text-center">
            <p className="text-[#ababab] text-lg mb-4">No customers yet</p>
            <button
              onClick={() => openModal()}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition"
            >
              Add your first customer
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6 hover:border-yellow-500 transition flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#f5f5f5] mb-2">{c.name}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-[#ababab]">📱 <span className="text-white">{c.phone || "-"}</span></p>
                    <p className="text-[#ababab]">📧 <span className="text-white">{c.email || "-"}</span></p>
                    <p className="text-[#ababab]">📍 <span className="text-white">{c.address || "-"}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openModal(c)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-lg p-8 w-full max-w-md border border-[#383838]">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">
                {editing ? "Edit Customer" : "Add New Customer"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Customer name"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Address"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-[#383838] hover:bg-[#484848] text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Add Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
