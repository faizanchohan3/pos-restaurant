import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { setUser } from "../redux/slices/userSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const ShopLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
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
    if (!loginData.email || !loginData.password) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      // Call backend API to authenticate shop
      const response = await fetch(`${API_BASE_URL}/api/shop-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || "Login failed", { variant: "error" });
        return;
      }

      const shopData = data.data;

      // Save shop_id and shop info to localStorage
      localStorage.setItem("selectedShop", shopData.id);
      localStorage.setItem(
        "shopSession",
        JSON.stringify({
          id: shopData.id,
          name: shopData.name,
          email: shopData.email,
        })
      );

      // Dispatch to Redux for authentication
      dispatch(
        setUser({
          _id: shopData.id,
          name: shopData.name,
          email: shopData.email,
          phone: shopData.phone,
          role: "Admin",
        })
      );

      enqueueSnackbar("Login successful!", { variant: "success" });
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Login error:", error);
      enqueueSnackbar("Connection error. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShopRegister = async (e) => {
    e.preventDefault();
    if (
      !registerData.name ||
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
      // Call backend API to register shop
      const response = await fetch(`${API_BASE_URL}/api/shop/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerData.name,
          ownerName: registerData.ownerName,
          email: registerData.email,
          phone: registerData.phone,
          address: registerData.address,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || "Registration failed", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar(
        "Shop registered successfully! Waiting for SuperAdmin approval.",
        { variant: "success" }
      );

      setRegisterData({
        name: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => setIsLogin(true), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      enqueueSnackbar("Connection error. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2a2a2a] rounded-2xl border border-[#383838] p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">🏪 Shop Login</h1>
          <p className="text-[#ababab]">Manage your restaurant</p>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              isLogin
                ? "bg-blue-600 text-white"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              !isLogin
                ? "bg-green-600 text-white"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleShopLogin} className="space-y-4">
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                placeholder="Enter shop email"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-blue-400"
              />
            </div>
            <div>
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Logging in..." : "Shop Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleShopRegister} className="space-y-4">
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">
                Shop Name
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                placeholder="Enter shop name"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">
                Owner Name
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                placeholder="Enter email"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">Phone</label>
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) =>
                  setRegisterData({ ...registerData, phone: e.target.value })
                }
                placeholder="Enter phone"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">
                Address
              </label>
              <input
                type="text"
                value={registerData.address}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    address: e.target.value,
                  })
                }
                placeholder="Enter address"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                placeholder="Enter password"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-[#ababab] text-sm mb-2 block">
                Confirm Password
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-green-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Registering..." : "Register Shop"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-[#383838] pt-4">
          <button
            onClick={() => window.history.back()}
            className="text-[#ababab] hover:text-blue-400 text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopLogin;
