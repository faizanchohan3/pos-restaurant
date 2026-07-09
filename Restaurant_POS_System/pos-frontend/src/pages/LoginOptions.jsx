import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginOptions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified login page
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#f5f5f5] mb-2">🍕 Steam Cafe</h1>
          <p className="text-[#f5f5f5] text-lg font-semibold">
            POS - Restaurant Management System
          </p>
        </div>

        {/* Login Loading */}
        <div className="text-center">
          <p className="text-[#ababab]">Redirecting to login...</p>
        </div>
      </div>
    </div>
  );
};

export default LoginOptions;
