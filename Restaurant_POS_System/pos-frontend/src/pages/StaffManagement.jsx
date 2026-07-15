import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { FiEdit2, FiTrash2, FiPlus, FiBook } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { getLedger, addLedgerEntry, deleteLedgerEntry } from "../https";
import { printReport } from "../utils";

const money = (n) => `PKR ${Number(n || 0).toFixed(2)}`;

const StaffManagement = () => {
  const { user, role } = useSelector((state) => state.user);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Cashier",
    password: "",
  });

  const shopId = localStorage.getItem("selectedShop");

  // Protect route - only Admin can access
  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  // Ledger (staff salary / advances / cash)
  const [ledger, setLedger] = useState([]);
  const [ledgerStaff, setLedgerStaff] = useState(null);
  const [ledgerForm, setLedgerForm] = useState({ type: "debit", amount: "", description: "" });

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await getLedger(shopId);
      if (res.data.success) setLedger(res.data.data);
    } catch {
      // ignore
    }
  };

  // Net = debit - credit. Positive => staff owes shop (e.g. rider holds cash);
  // negative => shop owes staff (e.g. unpaid salary).
  const balanceFor = (staffId) =>
    ledger
      .filter((e) => String(e.staffId) === String(staffId))
      .reduce((s, e) => s + (e.type === "debit" ? 1 : -1) * Number(e.amount || 0), 0);

  const openLedger = (member) => {
    setLedgerStaff(member);
    setLedgerForm({ type: "debit", amount: "", description: "" });
  };

  const staffLedger = ledgerStaff
    ? ledger.filter((e) => String(e.staffId) === String(ledgerStaff.id))
    : [];

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
        staffId: ledgerStaff.id,
        customerName: ledgerStaff.name,
        type: ledgerForm.type,
        amount: amt,
        description: ledgerForm.description || (ledgerForm.type === "debit" ? "Charge" : "Payment"),
      });
      if (res.data.success) {
        enqueueSnackbar("Staff ledger updated!", { variant: "success" });
        setLedgerForm({ type: "debit", amount: "", description: "" });
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

  // One-click: rider deposits held cash -> credit the exact held amount (balance -> 0).
  const handleSettleCash = async () => {
    const bal = balanceFor(ledgerStaff.id);
    if (bal <= 0) {
      enqueueSnackbar("No held cash to settle", { variant: "info" });
      return;
    }
    // List the delivery orders being settled so the entry is traceable.
    const deliveryNums = staffLedger
      .filter((e) => e.type === "debit" && e.deliveryId)
      .map((e) => `#${e.deliveryId}`);
    const desc = deliveryNums.length
      ? `Cash settled (deliveries ${deliveryNums.join(", ")})`
      : "Cash deposited / settled";
    try {
      const res = await addLedgerEntry({
        shopId: parseInt(shopId),
        staffId: ledgerStaff.id,
        customerName: ledgerStaff.name,
        type: "credit",
        amount: bal,
        description: desc,
      });
      if (res.data.success) {
        enqueueSnackbar(`Settled ${money(bal)} of held cash`, { variant: "success" });
        fetchLedger();
      }
    } catch {
      enqueueSnackbar("Failed to settle cash", { variant: "error" });
    }
  };

  const handlePrintStatement = () => {
    if (!ledgerStaff) return;
    let running = 0;
    const rows = staffLedger
      .map((e) => {
        running += (e.type === "debit" ? 1 : -1) * Number(e.amount || 0);
        return `<tr><td>${new Date(e.createdAt).toLocaleDateString()}</td><td>${e.description || ""}</td><td class="right">${e.type === "debit" ? money(e.amount) : "-"}</td><td class="right">${e.type === "credit" ? money(e.amount) : "-"}</td><td class="right">${money(running)}</td></tr>`;
      })
      .join("");
    const bal = balanceFor(ledgerStaff.id);
    const table = `<p style="margin:0 0 12px"><strong>Staff:</strong> ${ledgerStaff.name} (${ledgerStaff.role})</p>
      <table><thead><tr><th>Date</th><th>Description</th><th class="right">Debit</th><th class="right">Credit</th><th class="right">Balance</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" class="center">No entries</td></tr>'}</tbody>
      <tfoot><tr><td colspan="4">Net balance</td><td class="right">${money(bal)}</td></tr></tfoot></table>`;
    printReport("Staff Statement", ledgerStaff.name, table);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/staff/shop/${shopId}`
      );
      if (response.data.success) {
        setStaff(response.data.data);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch staff", { variant: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        password: "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Cashier",
        password: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Cashier",
      password: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!shopId) {
      enqueueSnackbar("No shop selected. Please log in again.", {
        variant: "error",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.role) {
      enqueueSnackbar("Please fill all required fields", {
        variant: "warning",
      });
      return;
    }

    if (editingStaff && !formData.password) {
      // For updates, password is optional (leave empty to keep existing)
    } else if (!editingStaff && !formData.password) {
      enqueueSnackbar("Password is required for new staff", {
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingStaff) {
        // Update staff
        const response = await axios.put(
          `${API_BASE_URL}/api/staff/${editingStaff.id}`,
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          }
        );
        if (response.data.success) {
          enqueueSnackbar("Staff updated successfully!", {
            variant: "success",
          });
          fetchStaff();
          handleCloseModal();
        }
      } else {
        // Add new staff
        const response = await axios.post(
          `${API_BASE_URL}/api/staff`,
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            password: formData.password,
            shopId: parseInt(shopId),
          }
        );
        if (response.data.success) {
          enqueueSnackbar("Staff added successfully!", { variant: "success" });
          fetchStaff();
          handleCloseModal();
        }
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to save staff",
        { variant: "error" }
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/staff/${staffId}`
      );
      if (response.data.success) {
        enqueueSnackbar("Staff deleted successfully!", { variant: "success" });
        fetchStaff();
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete staff", { variant: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-600";
      case "Manager":
        return "bg-blue-600";
      case "Cashier":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">
              👥 Staff Management
            </h1>
            <p className="text-[#ababab]">Manage your shop's staff members</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition"
          >
            <FiPlus size={20} /> Add Staff
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500"
          />
        </div>

        {/* Staff List */}
        {loading && !showModal ? (
          <div className="text-center text-[#ababab] py-8">Loading...</div>
        ) : staff.length === 0 ? (
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-8 text-center">
            <p className="text-[#ababab] text-lg mb-4">No staff members yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition"
            >
              Add your first staff member
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {staff
                .filter(
                  (member) =>
                    member.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    member.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((member) => (
              <div
                key={member.id}
                className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6 hover:border-yellow-500 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-[#f5f5f5]">
                        {member.name}
                      </h3>
                      <span
                        className={`${getRoleColor(
                          member.role
                        )} text-white text-xs font-bold px-3 py-1 rounded-full`}
                      >
                        {member.role}
                      </span>
                      {(() => {
                        const bal = balanceFor(member.id);
                        if (bal > 0)
                          return <span className="text-xs font-bold px-2 py-1 rounded-full text-red-400 bg-[#4a2020]">Holds {money(bal)}</span>;
                        if (bal < 0)
                          return <span className="text-xs font-bold px-2 py-1 rounded-full text-green-400 bg-[#1f3d2b]">Payable {money(-bal)}</span>;
                        return null;
                      })()}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <p className="text-[#ababab]">
                        📧 <span className="text-white">{member.email}</span>
                      </p>
                      <p className="text-[#ababab]">
                        📱 <span className="text-white">{member.phone}</span>
                      </p>
                      <p className="text-[#ababab]">
                        📅{" "}
                        <span className="text-white">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openLedger(member)}
                      title="Ledger / Salary"
                      className="bg-[#4a452e] hover:bg-[#5a5540] text-yellow-300 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                    >
                      <FiBook size={18} />
                    </button>
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(member.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination */}
            {staff.filter(
              (member) =>
                member.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                member.email
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
            ).length > itemsPerPage && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#383838]">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-[#383838] hover:bg-[#484848] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  ← Previous
                </button>
                <span className="text-[#ababab]">
                  Page {currentPage} of{" "}
                  {Math.ceil(
                    staff.filter(
                      (member) =>
                        member.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        member.email
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length / itemsPerPage
                  )}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          staff.filter(
                            (member) =>
                              member.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              member.email
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                          ).length / itemsPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(
                      staff.filter(
                        (member) =>
                          member.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          member.email
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                      ).length / itemsPerPage
                    )
                  }
                  className="bg-[#383838] hover:bg-[#484848] disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-lg p-8 w-full max-w-md border border-[#383838]">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-6">
                {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone"
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  />
                </div>

                <div>
                  <label className="text-[#ababab] text-sm mb-1 block">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Rider">Rider</option>
                    <option value="Worker">Worker</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {!editingStaff && (
                  <div>
                    <label className="text-[#ababab] text-sm mb-1 block">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-500 text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-[#383838] hover:bg-[#484848] text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
                  >
                    {loading
                      ? "Saving..."
                      : editingStaff
                      ? "Update Staff"
                      : "Add Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Ledger Modal */}
        {ledgerStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-[#383838]">
              <div className="flex items-center justify-between p-5 border-b border-[#383838]">
                <div>
                  <h2 className="text-xl font-bold text-[#f5f5f5]">🧾 {ledgerStaff.name} — Ledger</h2>
                  {(() => {
                    const bal = balanceFor(ledgerStaff.id);
                    return (
                      <p className={`text-sm font-semibold ${bal > 0 ? "text-red-400" : bal < 0 ? "text-green-400" : "text-[#ababab]"}`}>
                        {bal > 0 ? `Holds shop cash: ${money(bal)}` : bal < 0 ? `Payable to staff: ${money(-bal)}` : "Settled"}
                      </p>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-3">
                  {balanceFor(ledgerStaff.id) > 0 && (
                    <button
                      onClick={handleSettleCash}
                      className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold"
                      title="Rider deposits held cash"
                    >
                      💵 Settle Cash
                    </button>
                  )}
                  <button onClick={handlePrintStatement} className="flex items-center gap-2 bg-[#2e4a40] text-[#02ca3a] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#345c4d]">
                    <FaPrint size={14} /> Print
                  </button>
                  <button onClick={() => setLedgerStaff(null)} className="text-[#ababab] hover:text-white text-xl">✕</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {staffLedger.length === 0 ? (
                  <p className="text-[#ababab] text-sm text-center py-6">No entries yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-[#ababab] text-xs">
                      <tr><th className="text-left pb-2">Date</th><th className="text-left pb-2">Description</th><th className="text-right pb-2">Debit</th><th className="text-right pb-2">Credit</th><th></th></tr>
                    </thead>
                    <tbody>
                      {staffLedger.map((e) => (
                        <tr key={e.id} className="border-t border-[#383838] text-[#f5f5f5]">
                          <td className="py-2 text-xs text-[#ababab]">{new Date(e.createdAt).toLocaleDateString()}</td>
                          <td className="py-2">{e.description}</td>
                          <td className="py-2 text-right text-red-400">{e.type === "debit" ? money(e.amount) : "-"}</td>
                          <td className="py-2 text-right text-green-400">{e.type === "credit" ? money(e.amount) : "-"}</td>
                          <td className="py-2 text-right"><button onClick={() => handleDeleteLedger(e.id)} className="text-[#ababab] hover:text-red-400"><FiTrash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <form onSubmit={handleAddLedger} className="p-5 border-t border-[#383838] space-y-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLedgerForm({ ...ledgerForm, type: "credit" })} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${ledgerForm.type === "credit" ? "bg-green-700 text-white" : "bg-[#1f1f1f] text-[#ababab]"}`}>
                    Salary / Pay Staff (Credit)
                  </button>
                  <button type="button" onClick={() => setLedgerForm({ ...ledgerForm, type: "debit" })} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${ledgerForm.type === "debit" ? "bg-red-700 text-white" : "bg-[#1f1f1f] text-[#ababab]"}`}>
                    Advance / Cash Held (Debit)
                  </button>
                </div>
                <div className="flex gap-2">
                  <input type="number" value={ledgerForm.amount} onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })} placeholder="Amount" className="w-32 bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm" />
                  <input type="text" value={ledgerForm.description} onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })} placeholder="Note (e.g. July salary)" className="flex-1 bg-[#1f1f1f] text-white px-3 py-2 rounded-lg border border-[#383838] text-sm" />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-4 rounded-lg text-sm">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
