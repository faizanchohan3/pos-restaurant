import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedAdminRoute = ({ children }) => {
  const { isAuth, role } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  if (role !== "Admin") {
    return (
      <div className="bg-[#1f1f1f] h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[#f5f5f5] text-3xl font-bold mb-4">❌ Access Denied</h1>
          <p className="text-[#ababab] text-lg mb-4">This section is only for Admins</p>
          <p className="text-yellow-400 text-2xl">Your Role: {role || "Unknown"}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
