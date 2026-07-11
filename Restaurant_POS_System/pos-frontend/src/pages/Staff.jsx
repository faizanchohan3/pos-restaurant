import React, { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Staff = () => {
  const { role } = useSelector(state => state.user);

  // Check if user is admin
  if (role !== "Admin") {
    return <Navigate to="/" />;
  }
  const [staff, setStaff] = useState([
    { id: 1, name: "Raj Kumar", position: "Waiter", salary: 15000, phone: "9876543210", email: "raj@pos.com", joinDate: "2024-01-15" },
    { id: 2, name: "Priya Singh", position: "Chef", salary: 25000, phone: "9876543211", email: "priya@pos.com", joinDate: "2023-12-10" },
    { id: 3, name: "Amit Patel", position: "Cashier", salary: 12000, phone: "9876543212", email: "amit@pos.com", joinDate: "2024-02-01" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: "",
    phone: "",
    email: "",
    joinDate: "",
    password: "",
  });

  useEffect(() => {
    document.title = "POS | Staff Management";
  }, []);

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position || !formData.salary || !formData.phone) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }

    if (!editingId && !formData.password) {
      enqueueSnackbar("Password required for new staff member", { variant: "warning" });
      return;
    }

    if (editingId) {
      setStaff(staff.map(s => s.id === editingId ? { ...s, ...formData, id: editingId } : s));
      enqueueSnackbar("Staff updated successfully!", { variant: "success" });
      setEditingId(null);
    } else {
      const newStaff = {
        id: Math.max(...staff.map(s => s.id), 0) + 1,
        ...formData,
        salary: parseInt(formData.salary),
      };
      setStaff([...staff, newStaff]);

      // Save to localStorage for staff login
      const staffList = JSON.parse(localStorage.getItem("staffMembers") || "[]");
      staffList.push({
        id: newStaff.id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        role: formData.position, // Position is the role
      });
      localStorage.setItem("staffMembers", JSON.stringify(staffList));

      enqueueSnackbar(`✅ Staff member added! They can login with email: ${formData.email}`, { variant: "success" });
    }

    setFormData({ name: "", position: "", salary: "", phone: "", email: "", joinDate: "", password: "" });
    setShowAddModal(false);
  };

  const handleDeleteStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
    enqueueSnackbar("Staff member deleted!", { variant: "success" });
  };

  const handleEditStaff = (staffMember) => {
    setFormData(staffMember);
    setEditingId(staffMember.id);
    setShowAddModal(true);
  };

  const totalSalaries = staff.reduce((sum, s) => sum + parseInt(s.salary || 0), 0);

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Staff Management
          </h1>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", position: "", salary: "", phone: "", email: "", joinDate: "" });
            setShowAddModal(true);
          }}
          className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-bold hover:bg-yellow-500"
        >
          + Add Staff
        </button>
      </div>

      {/* Summary Card */}
      <div className="px-10 mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-[#383838]">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[#ababab] text-sm">Total Staff</p>
              <p className="text-white text-2xl font-bold">{staff.length}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Monthly Salaries</p>
              <p className="text-yellow-400 text-2xl font-bold">PKR {totalSalaries.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[#ababab] text-sm">Average Salary</p>
              <p className="text-green-400 text-2xl font-bold">PKR {Math.round(totalSalaries / staff.length).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="flex-1 overflow-auto px-10 pb-4">
        <table className="w-full text-left text-[#ababab]">
          <thead className="sticky top-0 bg-[#2a2a2a]">
            <tr className="border-b border-[#383838]">
              <th className="px-4 py-3 text-[#f5f5f5]">Name</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Position</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Salary</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Phone</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Email</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Join Date</th>
              <th className="px-4 py-3 text-[#f5f5f5]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-[#383838] hover:bg-[#2a2a2a]">
                <td className="px-4 py-3 text-[#f5f5f5] font-semibold">{member.name}</td>
                <td className="px-4 py-3">{member.position}</td>
                <td className="px-4 py-3 text-yellow-400 font-bold">PKR {member.salary.toLocaleString()}</td>
                <td className="px-4 py-3">{member.phone}</td>
                <td className="px-4 py-3 text-sm">{member.email}</td>
                <td className="px-4 py-3 text-sm">{member.joinDate}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleEditStaff(member)}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(member.id)}
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

      {/* Add/Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] rounded-lg p-8 w-96 max-h-96 overflow-y-auto">
            <h2 className="text-white text-xl font-bold mb-4">
              {editingId ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>
            <form onSubmit={handleAddStaff}>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter staff name"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                >
                  <option value="">Select position</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Monthly Salary *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  placeholder="Enter salary"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838]"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#ababab] text-sm mb-2 block">Password {!editingId && "*"}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter password for staff login"
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

export default Staff;
