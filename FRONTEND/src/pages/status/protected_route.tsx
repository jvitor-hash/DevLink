import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";

export default function ProtectedRoute() {
  const user = useCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
