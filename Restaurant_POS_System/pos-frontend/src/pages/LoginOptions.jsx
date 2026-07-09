import React from "react";
import { useNavigate } from "react-router-dom";

const LoginOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#f5f5f5] mb-2">🏪 Restro</h1>
          <p className="text-[#ababab] text-xl">
            Restaurant Management System
          </p>
          <p className="text-[#808080] text-sm mt-2">
            Multi-Tenant Platform
          </p>
        </div>

        {/* Login Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Login */}
          <div
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#383838] border-2 border-blue-600 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-3">
              Staff/Manager Login
            </h2>
            <p className="text-[#ababab] mb-6">
              Login as Staff, Waiter, or Cashier to manage orders, tables, and
              operations.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-blue-400 text-sm">✓ Manage Orders</p>
              <p className="text-blue-400 text-sm">✓ Manage Tables</p>
              <p className="text-blue-400 text-sm">✓ View POS Menu</p>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Continue →
            </button>
          </div>

          {/* Shop Login */}
          <div
            onClick={() => navigate("/shop-login")}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#383838] border-2 border-yellow-500 rounded-xl p-8 cursor-pointer hover:border-yellow-400 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-3">
              Shop Login
            </h2>
            <p className="text-[#ababab] mb-6">
              Login as a shop owner to access your restaurant's complete
              management dashboard.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-yellow-400 text-sm">✓ Shop Dashboard</p>
              <p className="text-yellow-400 text-sm">✓ Products & Categories</p>
              <p className="text-yellow-400 text-sm">✓ Staff & Expenses</p>
            </div>
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition">
              Continue →
            </button>
          </div>

          {/* SuperAdmin Login */}
          <div
            onClick={() => navigate("/superadmin-login")}
            className="bg-gradient-to-br from-[#2a2a2a] to-[#383838] border-2 border-purple-600 rounded-xl p-8 cursor-pointer hover:border-purple-400 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-[#f5f5f5] mb-3">
              SuperAdmin Panel
            </h2>
            <p className="text-[#ababab] mb-6">
              Access the SuperAdmin panel to create, approve, and manage all
              restaurant shops.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-purple-400 text-sm">✓ Approve Shops</p>
              <p className="text-purple-400 text-sm">✓ Manage All Shops</p>
              <p className="text-purple-400 text-sm">✓ System Analytics</p>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition">
              Continue →
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6 text-center">
          <h3 className="text-[#f5f5f5] font-bold mb-3">🆕 New Shop Owner?</h3>
          <p className="text-[#ababab] mb-4">
            Register your restaurant on the Shop Login page and wait for
            SuperAdmin approval. Once approved, you can log in and start
            managing your business!
          </p>
          <button
            onClick={() => navigate("/shop-login")}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg inline-block transition"
          >
            Register Your Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginOptions;
