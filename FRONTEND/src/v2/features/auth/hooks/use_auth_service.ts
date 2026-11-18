import { useSessionCache } from "@/shared/hooks/use_cache";
import { authService, type LoginCredentials, type RegisterCredentials, type RegisterRole } from "@/features/auth/service/auth_service";
import { useCallback } from "react";
import type { UserDTO } from "@/shared/types/database";

export default function useAuthService() {
  const [signedIn, setSignedIn, removeSignedIn] = useSessionCache<UserDTO | null>("user-authentication", null);

  const attemptLogin = useCallback(async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);

    if (result.success && result.data?.user) {
      setSignedIn(result.data.user);
    } else {
      console.error(`Failed to login: ${result.errors}`);
    }

    return result;
  }, [setSignedIn]);

  const attemptRegister = useCallback(async (credentials: RegisterCredentials, role: RegisterRole = "CLIENT") => {
    const result = await authService.register(credentials, role);

    if (result.success && result.data?.user) {
      setSignedIn(result.data.user);
    } else {
      console.error(`Failed to register user - role: ${role} | error: ${result.errors}`);
    }

    return result;
  }, [setSignedIn]);

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
