import React from "react";
import { Navigate } from "react-router-dom";

// This page is deprecated. Shops are managed in the SuperAdmin dashboard (database-driven).
const ShopManagement = () => {
  return <Navigate to="/superadmin" replace />;
};

export default ShopManagement;
