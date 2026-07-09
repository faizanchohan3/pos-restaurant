import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { enqueueSnackbar } from "notistack";
import { setUser } from "../redux/slices/userSlice";
import axios from "axios";

const StaffLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "POS | Staff Login";
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/shop");
      if (response.data.success) {
        setShops(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedShop(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shops", error);
      enqueueSnackbar("Failed to load shops", { variant: "error" });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !selectedShop) {
      enqueueSnackbar("Please fill all fields", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/api/staff/login", {
        email,
        password,
        shopId: parseInt(selectedShop),
      });

      if (response.data.success) {
        const staffData = response.data.data;
        dispatch(
          setUser({
            _id: staffData.id,
            name: staffData.name,
            email: staffData.email,
            phone: staffData.phone,
            role: staffData.role,
          })
        );

        // Store staff session
        localStorage.setItem(
          "staffSession",
          JSON.stringify({
            id: staffData.id,
            name: staffData.name,
            email: staffData.email,
            role: staffData.role,
            shopId: staffData.shopId,
          })
        );
        localStorage.setItem("selectedShop", staffData.shopId);

        enqueueSnackbar("Login successful!", { variant: "success" });
        setTimeout(() => navigate("/"), 1000);
      }
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Login failed",
        { variant: "error" }
      );
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2a2a2a] rounded-2xl border border-[#383838] p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f5f5f5] mb-2">👤 Restro</h1>
          <p className="text-[#ababab]">Staff Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[#ababab] text-sm mb-2 block">
              Select Shop *
            </label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-blue-400"
            >
              <option value="">Choose a shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#ababab] text-sm mb-2 block">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-[#ababab] text-sm mb-2 block">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-[#1f1f1f] text-white px-4 py-2 rounded-lg focus:outline-none border border-[#383838] focus:border-blue-400"
            />
          </div>

          <div className="mb-4 text-sm text-[#ababab]">
            <p>Demo Credentials:</p>
            <p className="text-[#808080]">Email: john@restaurant.com</p>
            <p className="text-[#808080]">Password: staff123</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Staff Login"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center border-t border-[#383838] pt-6">
          <p className="text-[#ababab] text-sm mb-3">Other login options?</p>
          <button
            onClick={() => navigate("/")}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Back to Login Portal →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
