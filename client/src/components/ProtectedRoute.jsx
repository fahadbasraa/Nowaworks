import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FullScreenLoader } from "./FullScreenLoader.jsx";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
