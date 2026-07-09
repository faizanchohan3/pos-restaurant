import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Financial = () => {
  const { user } = useSelector(state => state.user);

  // Check if user is admin
  if (user?.role !== "Admin") {
    return <Navigate to="/" />;
  }
  // Mock financial data
  const [financialData] = useState({
    // Revenue
    dineInRevenue: 125000,
    deliveryRevenue: 45000,
    takeawayRevenue: 35000,

    // Expenses
    staffSalaries: 95000,
    utilities: 5000,
    maintenance: 3000,
    supplies: 8000,
    rent: 50000,
    otherExpenses: 7000,

    // Assets
    cashInHand: 25000,
    bankBalance: 80000,
    inventory: 40000,
    equipment: 150000,

    // Liabilities
    vendorPayables: 15000,
    loanOutstanding: 100000,
  });

  useEffect(() => {
    document.title = "POS | Financial Report";
  }, []);

  // Calculate totals
  const totalRevenue = financialData.dineInRevenue + financialData.deliveryRevenue + financialData.takeawayRevenue;
  const totalExpenses = financialData.staffSalaries + financialData.utilities + financialData.maintenance + financialData.supplies + financialData.rent + financialData.otherExpenses;
  const grossProfit = totalRevenue - totalExpenses;
  const profitMargin = ((grossProfit / totalRevenue) * 100).toFixed(2);

  const totalAssets = financialData.cashInHand + financialData.bankBalance + financialData.inventory + financialData.equipment;
  const totalLiabilities = financialData.vendorPayables + financialData.loanOutstanding;
  const netEquity = totalAssets - totalLiabilities;

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
          <p className="text-[#ababab] text-sm">Month: July 2024</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-4">
        {/* Profit & Loss Statement */}
        <div className="mb-6">
          <div className="bg-[#2a2a2a] rounded-lg p-6 border-2 border-[#383838]">
            <h2 className="text-white text-xl font-bold mb-4">📊 Profit & Loss Statement</h2>

            {/* Revenue Section */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-bold text-lg mb-3">REVENUE</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Dine-In Sales</span>
                  <span className="text-[#f5f5f5] font-semibold">PKR {financialData.dineInRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Delivery Sales</span>
                  <span className="text-[#f5f5f5] font-semibold">PKR {financialData.deliveryRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Takeaway Sales</span>
                  <span className="text-[#f5f5f5] font-semibold">PKR {financialData.takeawayRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[#383838] pt-2 mt-2">
                  <span className="text-yellow-400 font-bold">Total Revenue</span>
                  <span className="text-yellow-400 font-bold">PKR {totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-6">
              <h3 className="text-red-400 font-bold text-lg mb-3">EXPENSES</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Staff Salaries</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.staffSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Utilities</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.utilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Maintenance</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.maintenance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Supplies</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.supplies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Rent</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ababab]">Other Expenses</span>
                  <span className="text-[#f5f5f5] font-semibold">-PKR {financialData.otherExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[#383838] pt-2 mt-2">
                  <span className="text-red-400 font-bold">Total Expenses</span>
                  <span className="text-red-400 font-bold">-PKR {totalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-[#1f1f1f] p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#ababab] text-sm">NET PROFIT</p>
                  <p className="text-green-400 text-3xl font-bold">PKR {grossProfit.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#ababab] text-sm">Profit Margin</p>
                  <p className="text-green-400 text-3xl font-bold">{profitMargin}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Sheet */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Assets */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 border-2 border-blue-900">
            <h2 className="text-blue-400 text-xl font-bold mb-4">💰 ASSETS</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#ababab]">Cash in Hand</span>
                <span className="text-[#f5f5f5]">PKR {financialData.cashInHand.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ababab]">Bank Balance</span>
                <span className="text-[#f5f5f5]">PKR {financialData.bankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ababab]">Inventory</span>
                <span className="text-[#f5f5f5]">PKR {financialData.inventory.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ababab]">Equipment & Fixed Assets</span>
                <span className="text-[#f5f5f5]">PKR {financialData.equipment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#383838] pt-2 mt-2 font-bold">
                <span className="text-blue-400">Total Assets</span>
                <span className="text-blue-400">PKR {totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 border-2 border-orange-900">
            <h2 className="text-orange-400 text-xl font-bold mb-4">📋 LIABILITIES & EQUITY</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#ababab]">Vendor Payables</span>
                <span className="text-[#f5f5f5]">-PKR {financialData.vendorPayables.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ababab]">Loan Outstanding</span>
                <span className="text-[#f5f5f5]">-PKR {financialData.loanOutstanding.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#383838] pt-2 mt-2">
                <span className="text-orange-400 font-semibold">Total Liabilities</span>
                <span className="text-orange-400 font-semibold">-PKR {totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t-2 border-[#383838] pt-3 mt-3 font-bold">
                <span className="text-green-400">Net Equity</span>
                <span className="text-green-400">PKR {netEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
            <p className="text-[#ababab] text-sm mb-2">Revenue</p>
            <p className="text-yellow-400 text-2xl font-bold">PKR {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
            <p className="text-[#ababab] text-sm mb-2">Expenses</p>
            <p className="text-red-400 text-2xl font-bold">PKR {totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
            <p className="text-[#ababab] text-sm mb-2">Net Profit</p>
            <p className="text-green-400 text-2xl font-bold">PKR {grossProfit.toLocaleString()}</p>
          </div>
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
            <p className="text-[#ababab] text-sm mb-2">Net Worth</p>
            <p className="text-blue-400 text-2xl font-bold">PKR {netEquity.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Financial;
