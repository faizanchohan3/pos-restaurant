import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { FiCheckCircle, FiXCircle, FiEye, FiLogOut, FiTrash2, FiKey } from "react-icons/fi";
import { approveShop, rejectShop, deleteShop } from "../https/index";
import API_BASE_URL from "../config/api";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingShops, setPendingShops] = useState([]);
  const [approvedShops, setApprovedShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [totalStaff, setTotalStaff] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordShop, setPasswordShop] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    document.title = "SuperAdmin - Shop Management";
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      // Load shops from database API
      const response = await fetch(`${API_BASE_URL}/api/shop`);
      if (response.ok) {
        const data = await response.json();
        const shops = data.data || [];

        const pending = shops.filter(s => s.status === "pending");
        const approved = shops.filter(s => s.status === "approved");

        setPendingShops(pending);
        setApprovedShops(approved);

        // Load total staff count from all shops
        let staffCount = 0;
        for (const shop of approved) {
          try {
            const staffRes = await fetch(`${API_BASE_URL}/api/staff/shop/${shop.id}`);
            const staffData = await staffRes.json();
            if (staffData.success && Array.isArray(staffData.data)) {
              staffCount += staffData.data.length;
            }
          } catch (e) {
            console.log("Error fetching staff for shop:", shop.id);
          }
        }
        setTotalStaff(staffCount);
      } else {
        console.log("No shops found in database");
      }
    } catch (error) {
      console.error("Failed to load shops from database:", error);
      // Show empty state if API fails
      setPendingShops([]);
      setApprovedShops([]);
    }
  };

  const handleApproveShop = async (shop) => {
    try {
      await approveShop(shop.id);
      setPendingShops(pendingShops.filter((s) => s.id !== shop.id));
      const approvedShop = { ...shop, status: "approved" };
      setApprovedShops([...approvedShops, approvedShop]);

      // Update localStorage
      const allApproved = [...approvedShops, approvedShop];
      localStorage.setItem("approvedShops", JSON.stringify(allApproved));
      localStorage.setItem(
        "pendingShops",
        JSON.stringify(pendingShops.filter((s) => s.id !== shop.id))
      );

      enqueueSnackbar(`✅ ${shop.name} approved successfully!`, {
        variant: "success",
      });
      loadShops(); // Reload shops from database
    } catch (error) {
      console.error("Approve shop error:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to approve shop", { variant: "error" });
    }
  };

  const handleRejectShop = async (shop) => {
    try {
      await rejectShop(shop.id);
      setPendingShops(pendingShops.filter((s) => s.id !== shop.id));
      localStorage.setItem(
        "pendingShops",
        JSON.stringify(pendingShops.filter((s) => s.id !== shop.id))
      );
      enqueueSnackbar(`❌ ${shop.name} rejected!`, { variant: "info" });
      loadShops(); // Reload shops from database
    } catch (error) {
      console.error("Reject shop error:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to reject shop", { variant: "error" });
    }
  };

  const handleDisapproveShop = async (shop) => {
    try {
      await rejectShop(shop.id);
      setApprovedShops(approvedShops.filter((s) => s.id !== shop.id));
      const disapprovedShop = { ...shop, status: "pending" };
      setPendingShops([...pendingShops, disapprovedShop]);

      // Update localStorage
      localStorage.setItem("approvedShops", JSON.stringify(approvedShops.filter((s) => s.id !== shop.id)));
      localStorage.setItem("pendingShops", JSON.stringify([...pendingShops, disapprovedShop]));

      enqueueSnackbar(`⏮️ ${shop.name} disapproved!`, { variant: "warning" });
    } catch (error) {
      enqueueSnackbar("Failed to disapprove shop", { variant: "error" });
    }
  };

  const handleDeleteShop = async (shop) => {
    if (!window.confirm(`Are you sure you want to delete ${shop.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteShop(shop.id);
      if (shop.status === "pending") {
        setPendingShops(pendingShops.filter((s) => s.id !== shop.id));
      } else {
        setApprovedShops(approvedShops.filter((s) => s.id !== shop.id));
      }

      // Update localStorage
      localStorage.setItem("approvedShops", JSON.stringify(approvedShops.filter((s) => s.id !== shop.id)));
      localStorage.setItem("pendingShops", JSON.stringify(pendingShops.filter((s) => s.id !== shop.id)));

      enqueueSnackbar(`🗑️ ${shop.name} deleted permanently!`, { variant: "success" });
      loadShops(); // Reload shops from database
    } catch (error) {
      console.error("Delete shop error:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to delete shop", { variant: "error" });
    }
  };

  const handleOpenPasswordModal = (shop) => {
    setPasswordShop(shop);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      enqueueSnackbar("Password must be at least 4 characters", { variant: "warning" });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shop/${passwordShop.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || "Failed to change password", { variant: "error" });
        return;
      }

      enqueueSnackbar(`🔑 Password changed for ${passwordShop.name}!`, { variant: "success" });
      setShowPasswordModal(false);
      setPasswordShop(null);
      setNewPassword("");
    } catch (error) {
      console.error("Change password error:", error);
      enqueueSnackbar("Connection error. Please try again.", { variant: "error" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDisableShop = (shop) => {
    setApprovedShops(
      approvedShops.map((s) =>
        s.id === shop.id ? { ...s, status: "disabled" } : s
      )
    );
    localStorage.setItem(
      "approvedShops",
      JSON.stringify(
        approvedShops.map((s) =>
          s.id === shop.id ? { ...s, status: "disabled" } : s
        )
      )
    );
    enqueueSnackbar(`${shop.name} disabled!`, { variant: "warning" });
  };

  const handleLogout = () => {
    localStorage.removeItem("superAdminSession");
    enqueueSnackbar("Logged out successfully!", { variant: "success" });
    setTimeout(() => {
      navigate("/Auth");
      window.location.replace("/Auth");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">
              👑 SuperAdmin Dashboard
            </h1>
            <p className="text-[#ababab]">Manage and approve restaurant shops</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-sm mb-1">Total Shops</p>
            <p className="text-3xl font-bold text-white">
              {pendingShops.length + approvedShops.length}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-yellow-900 rounded-lg p-4">
            <p className="text-[#ababab] text-sm mb-1">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-400">
              {pendingShops.length}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-green-900 rounded-lg p-4">
            <p className="text-[#ababab] text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-400">
              {approvedShops.length}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-sm mb-1">Total Staff</p>
            <p className="text-3xl font-bold text-blue-400">
              {totalStaff}
            </p>
          </div>
        </div>

        {/* Pending Shops Section */}
        {pendingShops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              ⏳ Pending Approval ({pendingShops.length})
            </h2>
            <div className="grid gap-4">
              {pendingShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-[#2a2a2a] border-2 border-yellow-600 rounded-lg p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#f5f5f5]">
                        {shop.name}
                      </h3>
                      <p className="text-[#ababab] text-sm">
                        Owner: {shop.ownerName}
                      </p>
                    </div>
                    <span className="bg-yellow-900 text-yellow-200 px-3 py-1 rounded-full text-sm font-semibold">
                      Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <p className="text-[#ababab]">
                      📧 <span className="text-white">{shop.email}</span>
                    </p>
                    <p className="text-[#ababab]">
                      📱 <span className="text-white">{shop.phone}</span>
                    </p>
                    <p className="text-[#ababab]">
                      📍 <span className="text-white">{shop.address}</span>
                    </p>
                    <p className="text-[#ababab]">
                      📅{" "}
                      <span className="text-white">{shop.createdAt}</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveShop(shop)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FiCheckCircle size={18} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectShop(shop)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FiXCircle size={18} /> Reject
                    </button>
                    <button
                      onClick={() => handleDeleteShop(shop)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                      title="Delete permanently"
                    >
                      <FiTrash2 size={16} /> Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedShop(shop);
                        setShowDetailsModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <FiEye size={18} /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Shops Section */}
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            ✅ Approved Shops ({approvedShops.length})
          </h2>
          <div className="grid gap-4">
            {approvedShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-[#2a2a2a] border-2 border-green-600 rounded-lg p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#f5f5f5]">
                      {shop.name}
                    </h3>
                    <p className="text-[#ababab] text-sm">
                      Owner: {shop.ownerName}
                    </p>
                  </div>
                  <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                    Approved
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <p className="text-[#ababab]">
                    📧 <span className="text-white">{shop.email}</span>
                  </p>
                  <p className="text-[#ababab]">
                    📱 <span className="text-white">{shop.phone}</span>
                  </p>
                  <p className="text-[#ababab]">
                    📍 <span className="text-white">{shop.address}</span>
                  </p>
                  <p className="text-[#ababab]">
                    📅{" "}
                    <span className="text-white">{shop.createdAt}</span>
                  </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleOpenPasswordModal(shop)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    title="Change shop password"
                  >
                    <FiKey size={16} /> Change Password
                  </button>
                  <button
                    onClick={() => handleDisapproveShop(shop)}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    title="Move back to pending"
                  >
                    ⏮️ Disapprove
                  </button>
                  <button
                    onClick={() => handleDeleteShop(shop)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    title="Delete permanently"
                  >
                    <FiTrash2 size={16} /> Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedShop(shop);
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <FiEye size={16} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 border border-[#383838]">
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-4">
              {selectedShop.name}
            </h2>

            <div className="space-y-3 mb-6">
              <p className="text-[#ababab]">
                <span className="font-semibold">Owner:</span>{" "}
                <span className="text-white">{selectedShop.ownerName}</span>
              </p>
              <p className="text-[#ababab]">
                <span className="font-semibold">Email:</span>{" "}
                <span className="text-white">{selectedShop.email}</span>
              </p>
              <p className="text-[#ababab]">
                <span className="font-semibold">Phone:</span>{" "}
                <span className="text-white">{selectedShop.phone}</span>
              </p>
              <p className="text-[#ababab]">
                <span className="font-semibold">Address:</span>{" "}
                <span className="text-white">{selectedShop.address}</span>
              </p>
              <p className="text-[#ababab]">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={
                    selectedShop.status === "approved"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {selectedShop.status.toUpperCase()}
                </span>
              </p>
              <p className="text-[#ababab]">
                <span className="font-semibold">Registered:</span>{" "}
                <span className="text-white">{selectedShop.createdAt}</span>
              </p>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && passwordShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 border border-[#383838]">
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-2 flex items-center gap-2">
              <FiKey /> Change Password
            </h2>
            <p className="text-[#ababab] text-sm mb-6">
              Set a new password for <span className="text-purple-400 font-semibold">{passwordShop.name}</span>
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-[#ababab] text-sm mb-2 block">Shop Email</label>
                <input
                  type="text"
                  value={passwordShop.email}
                  disabled
                  className="w-full bg-[#1f1f1f] text-[#888] px-4 py-2 rounded-lg border border-[#383838] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[#ababab] text-sm mb-2 block">New Password *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838] focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordShop(null);
                    setNewPassword("");
                  }}
                  className="flex-1 bg-[#383838] hover:bg-[#484848] text-white font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
