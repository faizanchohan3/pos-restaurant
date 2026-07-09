import React, { useState } from "react";
import { enqueueSnackbar } from "notistack";

const ShopSignup = ({ setIsSignup }) => {
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.shopName ||
      !formData.ownerName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      enqueueSnackbar("Please fill all required fields", { variant: "warning" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar("Passwords do not match!", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const newShop = {
        id: Date.now(),
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const pendingShops = JSON.parse(
        localStorage.getItem("pendingShops") || "[]"
      );

      // Check if email already exists
      const existingShop = pendingShops.find(s => s.email === formData.email);
      if (existingShop) {
        enqueueSnackbar("This email is already registered!", { variant: "error" });
        setLoading(false);
        return;
      }

      pendingShops.push(newShop);
      localStorage.setItem("pendingShops", JSON.stringify(pendingShops));

      enqueueSnackbar(
        "✅ Shop registered successfully! Waiting for SuperAdmin approval...",
        { variant: "success" }
      );

      // Reset form
      setFormData({
        shopName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

      // Go back to login after 2 seconds
      setTimeout(() => {
        setIsSignup(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Shop Name *</label>
        <input
          type="text"
          name="shopName"
          value={formData.shopName}
          onChange={handleChange}
          placeholder="Enter shop name"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Owner Name *</label>
        <input
          type="text"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          placeholder="Enter owner name"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter shop address"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <div>
        <label className="text-[#ababab] text-sm mb-2 block">Confirm Password *</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        {loading ? "Registering..." : "📝 Register Shop"}
      </button>

      <p className="text-[#ababab] text-xs text-center mt-4">
        After registration, wait for SuperAdmin approval to login.
      </p>
    </form>
  );
};

export default ShopSignup;
