import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSuperAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      // Call API to authenticate SuperAdmin from Neon database
      const response = await fetch(`${API_BASE_URL}/api/superadmin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || "Invalid credentials", { variant: "error" });
        return;
      }

      // Store superadmin session
      localStorage.setItem(
        "superAdminSession",
        JSON.stringify({ id: data.data.id, name: data.data.name, email: data.data.email })
      );
      enqueueSnackbar("Login successful!", { variant: "success" });

      // Redirect to superadmin dashboard
      setTimeout(() => navigate("/superadmin"), 1500);
    } catch (error) {
      console.error("Login error:", error);
      enqueueSnackbar("Connection error. Please try again.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminRegister = async (e) => {
    e.preventDefault();
    if (
      !registerData.name ||
      !registerData.email ||
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
      // Call API to create SuperAdmin in Neon database
      const response = await fetch(`${API_BASE_URL}/api/superadmin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        enqueueSnackbar(data.message || "Registration failed", { variant: "error" });
        return;
      }

      enqueueSnackbar(
        "SuperAdmin account created successfully! Please login.",
        { variant: "success" }
      );
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => setIsLogin(true), 2000);
    } catch (error) {
      console.error("Registration error:", error);
      enqueueSnackbar("Connection error. Please try again.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2a2a2a] rounded-2xl border border-[#383838] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">👑 Steam Cafe</h1>
          <p className="text-[#ababab]">SuperAdmin Dashboard</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              isLogin
                ? "bg-purple-600 text-white"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              !isLogin
                ? "bg-purple-600 text-white"
                : "bg-[#383838] text-[#ababab] hover:bg-[#484848]"
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleSuperAdminLogin}>
            <div className="mb-4">
              <label className="text-[#ababab] text-sm mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                placeholder="Enter email"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600"
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Logging in..." : "SuperAdmin Login"}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleSuperAdminRegister} className="space-y-4">
            <div>
              <label className="text-[#ababab] text-sm mb-1 block">
                Name *
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                placeholder="Enter your name"
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600 text-sm"
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600 text-sm"
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600 text-sm"
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
                className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-purple-600 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? "Registering..." : "Register as SuperAdmin"}
            </button>
          </form>
        )}

        {/* User Login Link */}
        <div className="mt-6 text-center border-t border-[#383838] pt-6">
          <p className="text-[#ababab] text-sm mb-3">Other login options?</p>
          <button
            onClick={() => navigate("/")}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Back to Login Portal →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
