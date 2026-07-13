import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

// Order bills are stored as a JSON object ({ total, tax, totalWithTax }) but
// may be a plain string/number on older records.
const billAmount = (bills) => {
  if (!bills) return 0;
  if (typeof bills === "object") return parseFloat(bills.totalWithTax) || 0;
  const parsed = parseFloat(bills);
  return isNaN(parsed) ? 0 : parsed;
};

const Financial = () => {
  const shopId = localStorage.getItem("selectedShop");
  const [loading, setLoading] = useState(true);
  const [orderRevenue, setOrderRevenue] = useState(0);
  const [deliveryRevenue, setDeliveryRevenue] = useState(0);
  const [expenses, setExpenses] = useState([]); // [{ category, amount }]

  useEffect(() => {
    document.title = "POS | Financial Report";
  }, []);

  useEffect(() => {
    const loadFinancials = async () => {
      if (!shopId) {
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

        const [orders, deliveries, expenseRows] = await Promise.all([
          safeGet("/api/order?"),
          safeGet("/api/delivery?"),
          safeGet("/api/expenses?"),
        ]);

        setOrderRevenue(orders.reduce((sum, o) => sum + billAmount(o.bills), 0));
        setDeliveryRevenue(
          deliveries.reduce((sum, d) => sum + (parseFloat(d.total) || 0), 0)
        );

        // Group expenses by category
        const byCategory = {};
        expenseRows.forEach((e) => {
          const cat = e.category || "Other";
          byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(e.amount) || 0);
        });
        setExpenses(
          Object.entries(byCategory).map(([category, amount]) => ({
            category,
            amount,
          }))
        );
      } catch (error) {
        console.error("Error loading financials:", error);
        enqueueSnackbar("Failed to load financial report", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadFinancials();
  }, [shopId]);

  const totalRevenue = orderRevenue + deliveryRevenue;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : "0.00";

  const fmt = (n) => `PKR ${Math.round(n).toLocaleString()}`;

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Financial Report
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[#ababab] text-sm">Live data for your shop</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-4">
        {loading ? (
          <p className="text-[#ababab] py-8">Loading financial report…</p>
        ) : (
          <>
            {/* Profit & Loss Statement */}
            <div className="mb-6">
              <div className="bg-[#2a2a2a] rounded-lg p-6 border-2 border-[#383838]">
                <h2 className="text-white text-xl font-bold mb-4">
                  📊 Profit &amp; Loss Statement
                </h2>

                {/* Revenue Section */}
                <div className="mb-6">
                  <h3 className="text-yellow-400 font-bold text-lg mb-3">
                    REVENUE
                  </h3>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-[#ababab]">Order Sales</span>
                      <span className="text-[#f5f5f5] font-semibold">
                        {fmt(orderRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#ababab]">Delivery Sales</span>
                      <span className="text-[#f5f5f5] font-semibold">
                        {fmt(deliveryRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#383838] pt-2 mt-2">
                      <span className="text-yellow-400 font-bold">
                        Total Revenue
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {fmt(totalRevenue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="mb-6">
                  <h3 className="text-red-400 font-bold text-lg mb-3">
                    EXPENSES
                  </h3>
                  <div className="space-y-2 ml-4">
                    {expenses.length === 0 ? (
                      <p className="text-[#ababab] text-sm">
                        No expenses recorded yet.
                      </p>
                    ) : (
                      expenses.map((e) => (
                        <div key={e.category} className="flex justify-between">
                          <span className="text-[#ababab]">{e.category}</span>
                          <span className="text-[#f5f5f5] font-semibold">
                            -{fmt(e.amount)}
                          </span>
                        </div>
                      ))
                    )}
                    <div className="flex justify-between border-t border-[#383838] pt-2 mt-2">
                      <span className="text-red-400 font-bold">
                        Total Expenses
                      </span>
                      <span className="text-red-400 font-bold">
                        -{fmt(totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Profit */}
                <div
                  className={`bg-[#1f1f1f] p-4 rounded-lg border-l-4 ${
                    netProfit >= 0 ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#ababab] text-sm">NET PROFIT</p>
                      <p
                        className={`text-3xl font-bold ${
                          netProfit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {fmt(netProfit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#ababab] text-sm">Profit Margin</p>
                      <p
                        className={`text-3xl font-bold ${
                          netProfit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {profitMargin}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
                <p className="text-[#ababab] text-sm mb-2">Revenue</p>
                <p className="text-yellow-400 text-2xl font-bold">
                  {fmt(totalRevenue)}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
                <p className="text-[#ababab] text-sm mb-2">Expenses</p>
                <p className="text-red-400 text-2xl font-bold">
                  {fmt(totalExpenses)}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
                <p className="text-[#ababab] text-sm mb-2">Net Profit</p>
                <p
                  className={`text-2xl font-bold ${
                    netProfit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {fmt(netProfit)}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
                <p className="text-[#ababab] text-sm mb-2">Profit Margin</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {profitMargin}%
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Financial;
