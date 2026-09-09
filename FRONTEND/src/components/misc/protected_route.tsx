// components/ProtectedRoute.tsx
import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '@/services/auth_service';

interface ProtectedRouteProps {
  children?: ReactNode; // Make children optional
  requiredPermission?: string;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  redirectTo = '/'
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const isAuthenticated = authService.isAuthenticated();

        if (!isAuthenticated) {
          // Try to refresh session
          const user = await authService.getCurrentUser();
          if (!user) {
            navigate(redirectTo, { state: { from: location } });
            return;
          }
        }

        // Check for specific permission if required
        if (requiredPermission) {
          const hasPermission = authService.hasPermission(requiredPermission);
          if (!hasPermission) {
            navigate(redirectTo, { state: { from: location } });
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate(redirectTo, { state: { from: location } });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location, redirectTo, requiredPermission]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If children are provided, render them; otherwise render Outlet for nested routes
  return isAuthorized ? (children ? <>{children}</> : <Outlet />) : null;
};
