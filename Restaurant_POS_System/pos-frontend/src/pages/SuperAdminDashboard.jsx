import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { FiCheckCircle, FiXCircle, FiEye, FiLogOut } from "react-icons/fi";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingShops, setPendingShops] = useState([
    {
      id: 1,
      name: "Test Shop 1",
      ownerName: "John Doe",
      email: "john@shop.com",
      phone: "9876543210",
      address: "123 Main St",
      status: "pending",
      createdAt: "2024-07-09",
    },
  ]);
  const [approvedShops, setApprovedShops] = useState([
    {
      id: 2,
      name: "Main Branch",
      ownerName: "Raj Kumar",
      email: "main@restaurant.com",
      phone: "9876543211",
      address: "Downtown",
      status: "approved",
      createdAt: "2024-06-01",
    },
    {
      id: 3,
      name: "Mall Branch",
      ownerName: "Priya Singh",
      email: "mall@restaurant.com",
      phone: "9876543212",
      address: "Shopping Mall",
      status: "approved",
      createdAt: "2024-06-15",
    },
  ]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    document.title = "SuperAdmin - Shop Management";
    // Load from localStorage
    const pending = JSON.parse(localStorage.getItem("pendingShops") || "[]");
    const approved = JSON.parse(localStorage.getItem("approvedShops") || "[]");
    if (pending.length > 0) setPendingShops(pending);
    if (approved.length > 0) setApprovedShops(approved);
  }, []);

  const handleApproveShop = (shop) => {
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

    enqueueSnackbar(`${shop.name} approved successfully!`, {
      variant: "success",
    });
  };

  const handleRejectShop = (shop) => {
    setPendingShops(pendingShops.filter((s) => s.id !== shop.id));
    localStorage.setItem(
      "pendingShops",
      JSON.stringify(pendingShops.filter((s) => s.id !== shop.id))
    );
    enqueueSnackbar(`${shop.name} rejected!`, { variant: "info" });
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
      navigate("/superadmin-login");
      window.location.reload();
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
            <p className="text-[#ababab] text-sm mb-1">Active Users</p>
            <p className="text-3xl font-bold text-blue-400">
              {approvedShops.length * 5}
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

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDisableShop(shop)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Disable Shop
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
    </div>
  );
};

export default SuperAdminDashboard;
