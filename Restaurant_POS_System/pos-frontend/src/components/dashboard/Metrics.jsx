import React, { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

// Bills are stored as a JSON object ({ total, tax, totalWithTax }) but may be a
// plain string/number on older records. Extract a numeric amount safely.
const billAmount = (bills) => {
  if (!bills) return 0;
  if (typeof bills === "object") return parseFloat(bills.totalWithTax) || 0;
  const parsed = parseFloat(bills);
  return isNaN(parsed) ? 0 : parsed;
};

const customerKey = (details) => {
  if (!details) return null;
  const d = typeof details === "object" ? details : {};
  return d.phone || d.name || null;
};

const Metrics = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState([]);
  const [itemsData, setItemsData] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!shopId) {
        enqueueSnackbar("Shop ID not found", { variant: "error" });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const safeGet = async (path) => {
          try {
            const res = await fetch(`${API_BASE_URL}${path}shopId=${shopId}`);
            if (!res.ok) return [];
            const json = await res.json();
            return json.success && Array.isArray(json.data) ? json.data : [];
          } catch {
            return [];
          }
        };

        const [orders, products, categories, tables] = await Promise.all([
          safeGet("/api/order?"),
          safeGet("/api/products?"),
          safeGet("/api/categories?"),
          safeGet("/api/table?"),
        ]);

        // Today's revenue
        const today = new Date().toDateString();
        const todayOrders = orders.filter(
          (o) => new Date(o.orderDate || o.createdAt).toDateString() === today
        );
        const todayRevenue = todayOrders.reduce(
          (sum, o) => sum + billAmount(o.bills),
          0
        );

        // Unique customers across all orders (by phone, fallback name)
        const uniqueCustomers = new Set(
          orders.map((o) => customerKey(o.customerDetails)).filter(Boolean)
        ).size;

        // Active (not completed/cancelled) orders
        const activeOrders = orders.filter(
          (o) =>
            o.orderStatus !== "completed" && o.orderStatus !== "cancelled"
        ).length;

        setMetricsData([
          {
            title: "Revenue (Today)",
            value: `PKR ${todayRevenue.toLocaleString()}`,
            color: "#025cca",
          },
          {
            title: "Total Customer",
            value: uniqueCustomers.toLocaleString(),
            color: "#02ca3a",
          },
        ]);

        setItemsData([
          { title: "Total Categories", value: `${categories.length}`, color: "#5b45b0" },
          { title: "Total Dishes", value: `${products.length}`, color: "#285430" },
          { title: "Active Orders", value: `${activeOrders}`, color: "#735f32" },
          { title: "Total Tables", value: `${tables.length}`, color: "#7f167f" },
        ]);
      } catch (error) {
        console.error("Error fetching metrics:", error);
        enqueueSnackbar("Failed to load metrics", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [shopId]);

  const renderCard = (item, index) => (
    <div
      key={index}
      className="shadow-sm rounded-lg p-4"
      style={{ backgroundColor: item.color }}
    >
      <p className="font-medium text-xs text-[#f5f5f5]">{item.title}</p>
      <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">
        {loading ? "..." : item.value}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">
            Overall Performance
          </h2>
          <p className="text-sm text-[#ababab]">
            Live figures for your shop, updated from the database.
          </p>
        </div>
        <button className="flex items-center gap-1 px-4 py-2 rounded-md text-[#f5f5f5] bg-[#1a1a1a]">
          Last 1 Month
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map(renderCard)}
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">Item Details</h2>
          <p className="text-sm text-[#ababab]">
            Categories, dishes, orders and tables for your shop.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {itemsData.map(renderCard)}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
