import { Navigate } from "react-router-dom";

export default function Protected({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) return <Navigate to="/" />;

  return children;
}
