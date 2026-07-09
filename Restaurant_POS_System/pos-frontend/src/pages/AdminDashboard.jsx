import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, name } = useSelector((state) => state.user);

  // Only Admin can see this
  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  const adminMenus = [
    {
      icon: "👥",
      title: "Manage Staff",
      description: "Add, edit, or remove staff members",
      route: "/staff-management",
      color: "from-blue-600 to-blue-800",
    },
    {
      icon: "🛍️",
      title: "Products",
      description: "Manage your restaurant products",
      route: "/products",
      color: "from-purple-600 to-purple-800",
    },
    {
      icon: "📂",
      title: "Categories",
      description: "Organize product categories",
      route: "/categories",
      color: "from-pink-600 to-pink-800",
    },
    {
      icon: "📦",
      title: "Stock Management",
      description: "Track inventory and stock levels",
      route: "/stock",
      color: "from-green-600 to-green-800",
    },
    {
      icon: "💸",
      title: "Expenses",
      description: "Track and manage expenses",
      route: "/expenses",
      color: "from-orange-600 to-orange-800",
    },
    {
      icon: "📊",
      title: "Financial Reports",
      description: "View P&L and financial statements",
      route: "/financial",
      color: "from-red-600 to-red-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">
            Welcome, {name}! 👋
          </h1>
          <p className="text-[#ababab] text-lg">
            Manage your restaurant operations from here
          </p>
        </div>

        {/* Admin Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenus.map((menu, idx) => (
            <div
              key={idx}
              onClick={() => navigate(menu.route)}
              className={`bg-gradient-to-br ${menu.color} rounded-xl p-6 cursor-pointer transform hover:scale-105 transition shadow-lg hover:shadow-2xl`}
            >
              <div className="text-5xl mb-4">{menu.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {menu.title}
              </h3>
              <p className="text-white text-opacity-90 mb-4">
                {menu.description}
              </p>
              <button className="bg-white text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition w-full">
                Open →
              </button>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Total Staff</p>
            <p className="text-3xl font-bold text-blue-400">12</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Active Orders</p>
            <p className="text-3xl font-bold text-green-400">5</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Products</p>
            <p className="text-3xl font-bold text-purple-400">48</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-yellow-400">₹5,240</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
