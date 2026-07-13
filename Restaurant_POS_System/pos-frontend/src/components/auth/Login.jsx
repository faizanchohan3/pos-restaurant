import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query"
import { login } from "../../https/index"
import { enqueueSnackbar } from "notistack";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
      setFormData({...formData, [e.target.name]: e.target.value});
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pos-backend-lime.vercel.app";

    const checkSuperAdmin = async (email, password) => {
      try {
        // Query backend API for SuperAdmin authentication from Neon database
        const response = await fetch(`${API_BASE_URL}/api/superadmin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("SuperAdmin login error:", error);
        return null;
      }
    };

    const checkShopLogin = async (email, password) => {
      try {
        // Query backend API for approved shop from Neon database
        const response = await fetch(`${API_BASE_URL}/api/shop-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Shop login error:", error);
        return null;
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.email || !formData.password) {
        enqueueSnackbar("Please fill all fields", { variant: "warning" });
        return;
      }

      // Check if it's a SuperAdmin first
      const superAdmin = await checkSuperAdmin(formData.email, formData.password);
      if (superAdmin) {
        localStorage.setItem("superAdminSession", JSON.stringify({ id: superAdmin.id, name: superAdmin.name, email: superAdmin.email }));
        enqueueSnackbar(`Welcome ${superAdmin.name}! Redirecting to dashboard...`, { variant: "success" });
        setTimeout(() => navigate("/superadmin"), 800);
        return;
      }

      // Check if it's an approved shop (from Neon database)
      const shop = await checkShopLogin(formData.email, formData.password);
      if (shop) {
        // Save shop_id for multi-tenant data isolation
        localStorage.setItem("selectedShop", shop.id);
        localStorage.setItem("shopSession", JSON.stringify({ id: shop.id, name: shop.name, email: shop.email }));
        // Also set user in Redux for authentication
        dispatch(setUser({ _id: shop.id, name: shop.name, email: shop.email, phone: shop.phone, role: "Admin" }));
        enqueueSnackbar(`Welcome ${shop.name}! Redirecting to dashboard...`, { variant: "success" });
        setTimeout(() => navigate("/"), 800);
        return;
      }

      // No match found in database
      enqueueSnackbar("Invalid credentials. Please check your email and password.", { variant: "error" });
    }

    const loginMutation = useMutation({
      mutationFn: (reqData) => login(reqData),
      onSuccess: (res) => {
          const { data } = res;
          console.log("Login successful:", data);
          const { _id, name, email, phone, role, shopId } = data.data;

          // Dispatch user to Redux
          dispatch(setUser({ _id, name, email, phone, role }));

          // Show success message
          enqueueSnackbar(`Welcome ${name}! Redirecting to dashboard...`, { variant: "success" });

          // Persist this user's real shop id (never hardcode)
          if (shopId) {
            localStorage.setItem("selectedShop", String(shopId));
          }

          // Redirect after a brief delay so user sees the success message
          setTimeout(() => {
            navigate("/");
          }, 800);
      },
      onError: (error) => {
        const message = error.response?.data?.message || "Login failed. Please check your credentials.";
        enqueueSnackbar(message, { variant: "error" });
        setIsSubmitting(false);
      }
    })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Email
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f] border border-[#383838] focus-within:border-yellow-400">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Password
          </label>
          <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f] border border-[#383838] focus-within:border-yellow-400">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-transparent flex-1 text-white focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loginMutation.isPending ? "🔄 Signing in..." : "✓ Sign In"}
        </button>

        {/* Status Message */}
        {loginMutation.isPending && (
          <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded-lg text-blue-200 text-sm text-center">
            🔐 Authenticating... Please wait
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
