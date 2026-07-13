import React from "react";
import { Navigate } from "react-router-dom";

// This page is deprecated. Staff is managed via StaffManagement (database-driven, filtered by shop_id).
const Staff = () => {
  return <Navigate to="/staff-management" replace />;
};

export default Staff;
