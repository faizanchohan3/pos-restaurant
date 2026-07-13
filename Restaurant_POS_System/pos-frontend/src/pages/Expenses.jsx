import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "Utilities",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const shopId = localStorage.getItem("selectedShop");

  useEffect(() => {
    document.title = "POS | Expenses";
    if (shopId) {
      fetchExpenses();
    }
  }, [shopId]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses?shopId=${shopId}`);
      const data = await response.json();

      if (data.success) {
        setExpenses(data.data);
      } else {
        enqueueSnackbar("Failed to load expenses", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/expenses/${editingId}`
        : `${API_BASE_URL}/api/expenses`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          shopId: parseInt(shopId),
        }),
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar(
          editingId ? "Expense updated!" : "Expense added!",
          { variant: "success" }
        );
        fetchExpenses();
        setShowAddModal(false);
        setFormData({
          category: "Utilities",
          description: "",
          amount: "",
          date: new Date().toISOString().split('T')[0],
        });
        setEditingId(null);
      } else {
        enqueueSnackbar(data.message || "Operation failed", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        enqueueSnackbar("Expense deleted!", { variant: "success" });
        fetchExpenses();
      } else {
        enqueueSnackbar("Failed to delete", { variant: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      enqueueSnackbar("Connection error", { variant: "error" });
    }
  };

  const handleEditExpense = (expense) => {
    setFormData(expense);
    setEditingId(expense.id);
    setShowAddModal(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const categories = [...new Set(expenses.map((e) => e.category))];
  const categoryExpenses = categories.map((cat) => ({
    category: cat,
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (e.amount || 0), 0),
  }));

  return (
    <section className="bg-[#1f1f1f] min-h-screen overflow-auto flex flex-col pb-10">
      <div className="flex items-center justify-between px-10 py-4 sticky top-0 bg-[#1f1f1f] border-b border-[#383838]">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Expenses
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              category: "Utilities",
              description: "",
              amount: "",
              date: new Date().toISOString().split('T')[0],
            });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="px-10 py-6">
        <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#383838]">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Total Expenses</p>
              <p className="text-red-400 text-2xl font-bold">
                PKR {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Categories</p>
              <p className="text-blue-400 text-2xl font-bold">{categories.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Total Items</p>
              <p className="text-green-400 text-2xl font-bold">{expenses.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Average Expense</p>
              <p className="text-purple-400 text-2xl font-bold">
                PKR {expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(0) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryExpenses.length > 0 && (
        <div className="px-10 py-6">
          <h2 className="text-[#f5f5f5] text-xl font-bold mb-4">By Category</h2>
          <div className="grid grid-cols-2 gap-4">
            {categoryExpenses.map((cat, idx) => (
              <div
                key={idx}
                className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4"
              >
                <p className="text-[#ababab] text-sm">{cat.category}</p>
                <p className="text-xl font-bold text-yellow-400">
                  PKR {cat.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="px-10 py-6">
        <h2 className="text-[#f5f5f5] text-xl font-bold mb-4">Expense Records</h2>

        {loading ? (
          <div className="text-center text-[#ababab] py-8">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-[#ababab] py-8">No expenses recorded</div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-[#2a2a2a] border border-[#383838] rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[#383838] px-3 py-1 rounded text-sm text-[#ababab]">
                      {expense.category}
                    </span>
                    <p className="text-[#f5f5f5] font-semibold">{expense.description}</p>
                  </div>
                  <p className="text-[#ababab] text-sm">{expense.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-red-400 font-bold text-lg">
                    -PKR {expense.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 hover:bg-[#383838] rounded text-blue-400"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 hover:bg-[#383838] rounded text-red-400"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 border border-[#383838]">
            <h2 className="text-[#f5f5f5] text-2xl font-bold mb-6">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-[#ababab] text-sm mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838]"
                >
                  <option>Utilities</option>
                  <option>Maintenance</option>
                  <option>Supplies</option>
                  <option>Rent</option>
                  <option>Salary</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-[#ababab] text-sm mb-2 block">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838]"
                />
              </div>

              <div>
                <label className="text-[#ababab] text-sm mb-2 block">Amount (PKR)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838]"
                />
              </div>

              <div>
                <label className="text-[#ababab] text-sm mb-2 block">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg border border-[#383838]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-[#383838] hover:bg-[#484848] text-white font-bold py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 rounded-lg"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Expenses;
