import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../https";
import { parseJSON } from "../../utils";

// Compact "all orders" summary card for the dashboard / home.
const OrdersReport = () => {
  const navigate = useNavigate();
  const shopId = localStorage.getItem("selectedShop");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    ready: 0,
    completed: 0,
    revenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getOrders(shopId);
        const orders = res.data?.data || [];
        const s = { total: orders.length, inProgress: 0, ready: 0, completed: 0, revenue: 0 };
        orders.forEach((o) => {
          const bills = parseJSON(o.bills, {});
          s.revenue += Number(bills.totalWithTax ?? bills.total ?? 0);
          if (o.orderStatus === "Ready") s.ready += 1;
          else if (o.orderStatus === "Completed" || o.orderStatus === "Delivered") s.completed += 1;
          else s.inProgress += 1;
        });
        setStats(s);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shopId]);

  const Tile = ({ label, value, color }) => (
    <div className="bg-[#1f1f1f] rounded-lg p-3 text-center">
      <p className="text-[#ababab] text-xs mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{loading ? "…" : value}</p>
    </div>
  );

  return (
    <div className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#f5f5f5]">📋 Orders Report</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-yellow-400 text-sm font-semibold hover:underline"
        >
          View all →
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Tile label="Total Orders" value={stats.total} color="text-white" />
        <Tile label="In Progress" value={stats.inProgress} color="text-yellow-400" />
        <Tile label="Ready" value={stats.ready} color="text-blue-400" />
        <Tile label="Completed" value={stats.completed} color="text-green-400" />
        <Tile
          label="Total Revenue"
          value={`PKR ${Math.round(stats.revenue).toLocaleString()}`}
          color="text-yellow-400"
        />
      </div>
    </div>
  );
};

export default OrdersReport;
