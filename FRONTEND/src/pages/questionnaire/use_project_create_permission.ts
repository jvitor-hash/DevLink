import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth_service";

/**
 * Guards the questionnaire page: resolves whether the current user may
 * create projects and redirects home when they cannot.
 */
export function useProjectCreatePermission(): boolean | null {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const checkPermission = async (): Promise<void> => {
      try {
        const hasPermission = await authService.hasPermission({ projects: ["create"] });

        if (cancelled) return;

        if (hasPermission) {
          setAllowed(true);
          return;
        }

        navigate("/", { state: { from: location } });
      } catch {
        if (!cancelled) navigate("/", { state: { from: location } });
      }
    };

    checkPermission();

    return () => {
      cancelled = true;
    };
  }, [navigate, location]);

  return allowed;
}
