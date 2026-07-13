import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiEdit2, FiTrash2, FiPlus, FiBook } from "react-icons/fi";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getLedger,
  addLedgerEntry,
  deleteLedgerEntry,
} from "../https";

const money = (n) => `PKR ${Number(n || 0).toFixed(2)}`;

const Customers = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  // Ledger
  const [ledger, setLedger] = useState([]); // all entries for shop
  const [ledgerCustomer, setLedgerCustomer] = useState(null);
  const [ledgerForm, setLedgerForm] = useState({ type: "credit", amount: "", description: "" });

  useEffect(() => {
    document.title = "POS | Customers";
    fetchCustomers();
    fetchLedger();
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

  const fetchLedger = async () => {
    if (!shopId) return;
    try {
      const res = await getLedger(shopId);
      if (res.data.success) setLedger(res.data.data);
    } catch {
      // ignore
    }
  };

  // balance = debits (owed) - credits (paid). Positive = customer owes you.
  const balanceFor = (customerId) =>
    ledger
      .filter((e) => String(e.customerId) === String(customerId))
      .reduce((sum, e) => sum + (e.type === "debit" ? 1 : -1) * Number(e.amount || 0), 0);

  const openLedger = (customer) => {
    setLedgerCustomer(customer);
    setLedgerForm({ type: "credit", amount: "", description: "" });
  };

  const handleAddLedger = async (e) => {
    e.preventDefault();
    const amt = parseFloat(ledgerForm.amount);
    if (!amt || amt <= 0) {
      enqueueSnackbar("Enter a valid amount", { variant: "warning" });
      return;
    }
    try {
      const res = await addLedgerEntry({
        shopId: parseInt(shopId),
        customerId: ledgerCustomer.id,
        customerName: ledgerCustomer.name,
        type: ledgerForm.type,
        amount: amt,
        description:
          ledgerForm.description || (ledgerForm.type === "credit" ? "Payment received" : "Charge"),
      });
      if (res.data.success) {
        enqueueSnackbar("Ledger updated!", { variant: "success" });
        setLedgerForm({ type: "credit", amount: "", description: "" });
        fetchLedger();
      }
    } catch {
      enqueueSnackbar("Failed to update ledger", { variant: "error" });
    }
  };

  const handleDeleteLedger = async (id) => {
    try {
      const res = await deleteLedgerEntry(id);
      if (res.data.success) fetchLedger();
    } catch {
      enqueueSnackbar("Failed to delete entry", { variant: "error" });
    }
  };

  const customerLedger = ledgerCustomer
    ? ledger.filter((e) => String(e.customerId) === String(ledgerCustomer.id))
    : [];

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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-[#f5f5f5]">{c.name}</h3>
                    {(() => {
                      const bal = balanceFor(c.id);
                      if (bal > 0)
                        return <span className="text-xs font-bold px-2 py-1 rounded-full text-red-400 bg-[#4a2020]">Owes {money(bal)}</span>;
                      if (bal < 0)
                        return <span className="text-xs font-bold px-2 py-1 rounded-full text-green-400 bg-[#1f3d2b]">Advance {money(-bal)}</span>;
                      return <span className="text-xs font-bold px-2 py-1 rounded-full text-[#ababab] bg-[#333]">Settled</span>;
                    })()}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <p className="text-[#ababab]">📱 <span className="text-white">{c.phone || "-"}</span></p>
                    <p className="text-[#ababab]">📧 <span className="text-white">{c.email || "-"}</span></p>
                    <p className="text-[#ababab]">📍 <span className="text-white">{c.address || "-"}</span></p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openLedger(c)}
                    title="Ledger"
                    className="bg-[#4a452e] hover:bg-[#5a5540] text-yellow-300 font-bold py-2 px-4 rounded-lg transition"
                  >
                    <FiBook size={18} />
                  </button>
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

        {/* Ledger Modal */}
        {ledgerCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-[#383838]">
              <div className="flex items-center justify-between p-5 border-b border-[#383838]">
                <div>
                  <h2 className="text-xl font-bold text-[#f5f5f5]">
                    🧾 {ledgerCustomer.name} — Ledger
                  </h2>
                  {(() => {
                    const bal = balanceFor(ledgerCustomer.id);
                    return (
                      <p className={`text-sm font-semibold ${bal > 0 ? "text-red-400" : bal < 0 ? "text-green-400" : "text-[#ababab]"}`}>
                        {bal > 0 ? `Owes you ${money(bal)}` : bal < 0 ? `Advance ${money(-bal)}` : "Settled"}
                      </p>
                    );
                  })()}
                </div>
                <button onClick={() => setLedgerCustomer(null)} className="text-[#ababab] hover:text-white text-xl">✕</button>
              </div>

              {/* Entries */}
              <div className="flex-1 overflow-y-auto p-5">
                {customerLedger.length === 0 ? (
                  <p className="text-[#ababab] text-sm text-center py-6">No ledger entries yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-[#ababab] text-xs">
                      <tr>
                        <th className="text-left pb-2">Date</th>
                        <th className="text-left pb-2">Description</th>
                        <th className="text-right pb-2">Debit</th>
                        <th className="text-right pb-2">Credit</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerLedger.map((e) => (
                        <tr key={e.id} className="border-t border-[#383838] text-[#f5f5f5]">
                          <td className="py-2 text-xs text-[#ababab]">{new Date(e.createdAt).toLocaleDateString()}</td>
                          <td className="py-2">{e.description}</td>
                          <td className="py-2 text-right text-red-400">{e.type === "debit" ? money(e.amount) : "-"}</td>
                          <td className="py-2 text-right text-green-400">{e.type === "credit" ? money(e.amount) : "-"}</td>
                          <td className="py-2 text-right">
                            <button onClick={() => handleDeleteLedger(e.id)} className="text-[#ababab] hover:text-red-400"><FiTrash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Add entry */}
              <form onSubmit={handleAddLedger} className="p-5 border-t border-[#383838] space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLedgerForm({ ...ledgerForm, type: "credit" })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${ledgerForm.type === "credit" ? "bg-green-700 text-white" : "bg-[#1f1f1f] text-[#ababab]"}`}
                  >
                    Payment Received (Credit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLedgerForm({ ...ledgerForm, type: "debit" })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${ledgerForm.type === "debit" ? "bg-red-700 text-white" : "bg-[#1f1f1f] text-[#ababab]"}`}
                  >
                    Charge (Debit)
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={ledgerForm.amount}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                    placeholder="Amount"
                    className="w-32 bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm"
                  />
                  <input
                    type="text"
                    value={ledgerForm.description}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                    placeholder="Note (optional)"
                    className="flex-1 bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm"
                  />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 rounded-lg text-sm">
                    Add
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
