import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import AdminDashboard from "./AdminDashboard";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";

const Home = () => {
  const { role, name } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  // Show Admin Dashboard for Admin role
  if (role === "Admin") {
    return <AdminDashboard />;
  }

  // Staff/Cashier/Manager dashboard
  return (
    <div className="bg-[#1f1f1f] min-h-screen">
      <div className="p-8 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#f5f5f5] mb-2">
            Welcome, {name}! 👋
          </h1>
          <p className="text-[#ababab]">Your role: <span className="text-yellow-400 font-bold">{role}</span></p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-xs mb-1">Today's Orders</p>
            <p className="text-2xl font-bold text-blue-400">24</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-xs mb-1">Today's Revenue</p>
            <p className="text-2xl font-bold text-green-400">₹8,500</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-xs mb-1">Active Tables</p>
            <p className="text-2xl font-bold text-purple-400">5</p>
          </div>
          <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4">
            <p className="text-[#ababab] text-xs mb-1">Pending Orders</p>
            <p className="text-2xl font-bold text-orange-400">3</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-4">
                📋 Recent Orders
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((order) => (
                  <div
                    key={order}
                    className="bg-[#1f1f1f] p-4 rounded-lg flex justify-between items-center hover:bg-[#383838] transition"
                  >
                    <div>
                      <p className="text-white font-semibold">Order #{1001 + order}</p>
                      <p className="text-[#ababab] text-sm">Table {order}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">₹{(Math.random() * 500 + 100).toFixed(0)}</p>
                      <p className="text-[#ababab] text-xs">
                        {order % 2 === 0 ? "Completed" : "In Progress"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/orders")}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
              >
                View All Orders →
              </button>
            </div>
          </div>

          {/* Right Section - Quick Actions */}
          <div>
            <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#f5f5f5] mb-4">
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/menu")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
                >
                  🍽️ View Menu
                </button>
                <button
                  onClick={() => navigate("/tables")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
                >
                  🪑 Manage Tables
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
                >
                  📝 Create Order
                </button>
                <button
                  onClick={() => navigate("/delivery")}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition text-sm"
                >
                  🚚 Delivery Orders
                </button>
              </div>
            </div>

            {/* Staff Info */}
            <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6 mt-4">
              <h3 className="text-lg font-bold text-[#f5f5f5] mb-3">
                ℹ️ Info
              </h3>
              <div className="space-y-2 text-sm text-[#ababab]">
                <p>📍 <span className="text-white">Main Branch</span></p>
                <p>⏰ <span className="text-white">9:00 AM - 11:00 PM</span></p>
                <p>📞 <span className="text-white">+91-9876543210</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;
