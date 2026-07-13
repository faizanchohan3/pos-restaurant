import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Restricts a route to a set of roles. Falls back to an Access Denied screen
// for authenticated users whose role is not permitted.
const ProtectedRoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuth, role } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="bg-[#1f1f1f] h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[#f5f5f5] text-3xl font-bold mb-4">
            ❌ Access Denied
          </h1>
          <p className="text-[#ababab] text-lg mb-4">
            You don't have permission to view this section
          </p>
          <p className="text-yellow-400 text-2xl">Your Role: {role || "Unknown"}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoleRoute;
