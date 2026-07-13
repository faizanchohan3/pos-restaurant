import React, { useState, useEffect } from "react";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const Expenses = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, category: "Utilities", description: "Electricity bill", amount: 5000, date: "2024-07-01" },
    { id: 2, category: "Maintenance", description: "Kitchen equipment repair", amount: 3000, date: "2024-07-02" },
    { id: 3, category: "Supplies", description: "Cleaning supplies", amount: 1500, date: "2024-07-03" },
    { id: 4, category: "Rent", description: "Monthly rent", amount: 50000, date: "2024-07-01" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "Utilities",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    document.title = "POS | Expenses";
  }, []);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    if (editingId) {
      setExpenses(expenses.map(exp => exp.id === editingId ? { ...exp, ...formData, id: editingId, amount: parseInt(formData.amount) } : exp));
      enqueueSnackbar("Expense updated!", { variant: "success" });
      setEditingId(null);
    } else {
      const newExpense = {
        id: Math.max(...expenses.map(e => e.id), 0) + 1,
        ...formData,
        amount: parseInt(formData.amount),
      };
      setExpenses([...expenses, newExpense]);
      enqueueSnackbar("Expense added!", { variant: "success" });
    }

    setFormData({ category: "Utilities", description: "", amount: "", date: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
    enqueueSnackbar("Expense deleted!", { variant: "success" });
  };

  const handleEditExpense = (expense) => {
    setFormData(expense);
    setEditingId(expense.id);
    setShowAddModal(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = [...new Set(expenses.map(e => e.category))];
  const categoryExpenses = categories.map(cat => ({
    category: cat,
    amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0),
  }));

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Expenses
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ category: "Utilities", description: "", amount: "", date: new Date().toISOString().split('T')[0] });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="px-10 mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Total Expenses</p>
              <p className="text-red-400 text-2xl font-bold">PKR {totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Categories</p>
              <p className="text-white text-2xl font-bold">{categories.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Avg. per Expense</p>
              <p className="text-blue-400 text-2xl font-bold">PKR {Math.round(totalExpenses / expenses.length).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Transactions</p>
              <p className="text-green-400 text-2xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-10 mb-4">
        <div className="grid grid-cols-4 gap-3">
          {categoryExpenses.map((cat) => (
            <div key={cat.category} className="bg-[#2a2a2a] rounded-lg p-3 border border-[#383838]">
              <p className="text-[#ababab] text-xs">{cat.category}</p>
              <p className="text-yellow-400 font-bold mt-1">PKR {cat.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        <table className="w-full text-left text-[#ababab]">
          <thead className="sticky top-0 bg-[#2a2a2a]">
            <tr className="border-b border-[#383838]">
              <th className="px-4 py-3 text-[#f5f5f5]">Date</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Category</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Description</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Amount</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-[#383838] hover:bg-[#2a2a2a]">
                <td className="px-4 py-3 text-[#f5f5f5]">{expense.date}</td>
                <td className="px-4 py-3">
                  <span className="bg-[#383838] text-[#f5f5f5] px-3 py-1 rounded text-sm">
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3">{expense.description}</td>
                <td className="px-4 py-3 text-red-400 font-bold">-PKR {expense.amount.toLocaleString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-4">
              {editingId ? "Edit Expense" : "Add New Expense"}
            </h2>
            <form onSubmit={handleAddExpense}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Rent">Rent</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter description"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-[#383838] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#484848]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </section>
  );
};

export default Expenses;
