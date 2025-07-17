import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { token, role, isLoading } = useAuth();

  if (isLoading) return null; // ✅ wait until localStorage is loaded

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return children;
}
