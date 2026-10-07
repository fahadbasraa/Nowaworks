import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FullScreenLoader } from "./FullScreenLoader.jsx";

export function RoleRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/access-denied" replace />;

  return <Outlet />;
}
