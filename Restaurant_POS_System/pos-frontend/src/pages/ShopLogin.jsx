import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

const ShopLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ shopName: "", password: "" });
  const [registerData, setRegisterData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleShopLogin = async (e) => {
    e.preventDefault();
    if (!loginData.shopName || !loginData.password) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      const shops = JSON.parse(localStorage.getItem("approvedShops") || "[]");
      const shop = shops.find(
        (s) => s.name === loginData.shopName && s.status === "approved"
      );

      if (!shop) {
        enqueueSnackbar("Shop not found or not approved yet!", {
          variant: "error",
        });
        return;
      }

      if (shop.password !== loginData.password) {
        enqueueSnackbar("Invalid credentials!", { variant: "error" });
        return;
      }

      // Store shop session
      localStorage.setItem(
        "shopSession",
        JSON.stringify({ id: shop.id, name: shop.name, email: shop.email })
      );
      enqueueSnackbar("Login successful!", { variant: "success" });

      // Redirect to shop dashboard
      setTimeout(() => navigate("/"), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleShopRegister = async (e) => {
    e.preventDefault();
    if (
      !registerData.shopName ||
      !registerData.ownerName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password
    ) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      enqueueSnackbar("Passwords do not match!", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const newShop = {
        id: Date.now(),
        name: registerData.shopName,
        ownerName: registerData.ownerName,
        email: registerData.email,
        phone: registerData.phone,
        address: registerData.address,
        password: registerData.password,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const pendingShops = JSON.parse(
        localStorage.getItem("pendingShops") || "[]"
      );
      pendingShops.push(newShop);
      localStorage.setItem("pendingShops", JSON.stringify(pendingShops));

      enqueueSnackbar(
        "Shop registered successfully! Waiting for SuperAdmin approval.",
        { variant: "success" }
      );
      setRegisterData({
        shopName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => setIsLogin(true), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2a2a2a] rounded-2xl border border-[#383838] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">🏪 Steam Cafe</h1>
          <p className="text-[#ababab]">Restaurant Management System</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              isLogin
                ? "bg-yellow-400 text-gray-900"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              !isLogin
                ? "bg-yellow-400 text-gray-900"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleShopLogin}>
            <div className="mb-4">
              <label className="text-[#ababab] text-sm mb-2 block">
                Shop Name
              </label>
              <input
                type="text"
                value={loginData.shopName}
                onChange={(e) =>
                  setLoginData({ ...loginData, shopName: e.target.value })
                }
                placeholder="Enter shop name"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
              />
            </div>
            <div className="mb-6">
              <label className="text-[#ababab] text-sm mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Shop Login"}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleShopRegister} className="space-y-4">
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Shop Name *
              </label>
              <input
                type="text"
                value={registerData.shopName}
                onChange={(e) =>
                  setRegisterData({ ...registerData, shopName: e.target.value })
                }
                placeholder="Enter shop name"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Owner Name *
              </label>
              <input
                type="text"
                value={registerData.ownerName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    ownerName: e.target.value,
                  })
                }
                placeholder="Enter owner name"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Email *
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                placeholder="Enter email"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Phone *
              </label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) =>
                  setRegisterData({ ...registerData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Address
              </label>
              <input
                type="text"
                value={registerData.address}
                onChange={(e) =>
                  setRegisterData({ ...registerData, address: e.target.value })
                }
                placeholder="Enter address"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Password *
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Confirm Password *
              </label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm password"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-yellow-400 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Registering..." : "Register Shop"}
            </button>
          </form>
        )}

        {/* User Login Link */}
        <div className="mt-6 text-center border-t border-[#383838] pt-6">
          <p className="text-[#ababab] text-sm mb-3">Staff/Manager Login?</p>
          <button
            onClick={() => navigate("/auth")}
            className="text-yellow-400 hover:text-yellow-500 font-semibold"
          >
            Go to User Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopLogin;
