import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../types/auth";
import DashboardPage from "../pages/dashboard/dashboard-page";

export default function HomeRedirect() {
  const { hasRole } = useAuth();

  if (hasRole(ROLES.ADMIN, ROLES.RH)) {
    return <DashboardPage />;
  }

  return <Navigate to="/my-space" replace />;
}
