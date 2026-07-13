import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import BottomNav from "../components/shared/BottomNav";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, name } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeOrders: 0,
    totalProducts: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Only Admin can see this
  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  // Get shop_id from localStorage (set during login)
  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    if (!shopId) {
      enqueueSnackbar("Shop ID not found", { variant: "error" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch staff count for this shop
      const staffRes = await fetch(`${API_BASE_URL}/api/staff/shop/${shopId}`);
      const staffData = await staffRes.json();
      const totalStaff = staffData.success ? staffData.data.length : 0;

      // Fetch products for this shop (if endpoint exists)
      let totalProducts = 0;
      try {
        const productsRes = await fetch(`${API_BASE_URL}/api/products?shopId=${shopId}`);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          totalProducts = productsData.success ? productsData.data.length : 0;
        }
      } catch (e) {
        console.log("Products endpoint not available");
      }

      // Fetch orders for today (if endpoint exists)
      let activeOrders = 0;
      let todayRevenue = 0;
      try {
        const ordersRes = await fetch(`${API_BASE_URL}/api/order?shopId=${shopId}`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.success && ordersData.data) {
            // Filter orders from today
            const today = new Date().toDateString();
            const todayOrders = ordersData.data.filter(
              (order) => new Date(order.createdAt).toDateString() === today
            );
            activeOrders = todayOrders.filter(
              (o) => o.orderStatus !== "completed" && o.orderStatus !== "cancelled"
            ).length;

            // Calculate today's revenue. bills is a JSON object
            // ({ total, tax, totalWithTax }) but may be a string on old records.
            todayRevenue = todayOrders.reduce((sum, order) => {
              const bills = order.bills;
              if (bills && typeof bills === "object") {
                return sum + (parseFloat(bills.totalWithTax) || 0);
              }
              return sum + (parseFloat(bills) || 0);
            }, 0);
          }
        }
      } catch (e) {
        console.log("Orders endpoint not fully available");
      }

      setStats({
        totalStaff,
        activeOrders,
        totalProducts,
        todayRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      enqueueSnackbar("Failed to load dashboard stats", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

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
      icon: "👤",
      title: "Customers",
      description: "Manage your shop's customers",
      route: "/customers",
      color: "from-teal-600 to-teal-800",
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
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8 pb-24">
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
            <p className="text-3xl font-bold text-blue-400">
              {loading ? "..." : stats.totalStaff}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Active Orders</p>
            <p className="text-3xl font-bold text-green-400">
              {loading ? "..." : stats.activeOrders}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Products</p>
            <p className="text-3xl font-bold text-purple-400">
              {loading ? "..." : stats.totalProducts}
            </p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
            <p className="text-[#ababab] text-sm mb-2">Today's Revenue</p>
            <p className="text-3xl font-bold text-yellow-400">
              {loading ? "..." : `PKR ${stats.todayRevenue.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
