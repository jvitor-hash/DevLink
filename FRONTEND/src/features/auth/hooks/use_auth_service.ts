import { useSessionCache } from "@/shared/hooks/use_cache";
import { authService } from "@/features/auth/service/auth_service";
import { useCallback, useEffect } from "react";

export default function useAuthService() {
  const [signedIn, setSignedIn, removeSignedIn] = useSessionCache<any>("user-authentication", null);

  const attemptLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      const result = await authService.login(credentials);

      if (result.success && result.data?.user) {
        setSignedIn(result.data.user);
      } else {
        console.error("Failed to login:", result.errors);
      }

      return result;
    },
    [setSignedIn]
  );

  const attemptRegister = useCallback(
    async (credentials: any, role: "CLIENT" | "PROGRAMMER") => {
      const result = await authService.register(credentials, role);

      if (result.success && result.data?.user) {
        setSignedIn(result.data.user);
      } else {
        console.error(`Failed to register user - role: ${role} | error:`, result.errors);
      }

      return result;
    },
    [setSignedIn]
  );

  const signOut = useCallback(async () => {
    const result = await authService.logout();
    removeSignedIn();
    return result;
  }, [removeSignedIn]);

  const resetPassword = useCallback((email: string, redirectTo = window.location.origin) => {
    return authService.resetPassword(email, redirectTo);
  }, []);

  const refreshSession = useCallback(async () => {
    const result = await authService.getCurrentSession();
    if (result.success && result.data?.user) {
      setSignedIn(result.data.user);
    } else {
      removeSignedIn();
    }
    return result;
  }, [setSignedIn, removeSignedIn]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    signedIn,
    setSignedIn,
    removeSignedIn,
    attemptLogin,
    attemptRegister,
    signOut,
    resetPassword,
    refreshSession,
  } as const;
}
