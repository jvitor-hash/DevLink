import { useSessionCache } from "@/shared/hooks/use_cache";
import { authService } from "@/features/auth/service/auth_service";
import { useCallback } from "react";

export default function useAuthService() {
  const [signedIn, setSignedIn, removeSignedIn] = useSessionCache<any>("user-authentication", null);
  
  const attemptLogin = useCallback(async (credentials: any) => {
    const result = await authService.login(credentials);
    
    if (result.success)
      console.error(`Failed to login: ${result.errors}`);
    else
      setSignedIn(result.data);

    return result;
  }, [setSignedIn]);

  const attemptRegister = useCallback(async (credentials: any, role: "CLIENT" | "PROGRAMMER") => {
    const result = await authService.register(credentials, role);

    if (result.success)
      setSignedIn(result.data);
    else
      console.error(`Failed to register user - role: ${role} | error: ${result.errors}`);

    return result;
  }, [setSignedIn]);

  const signOut = useCallback(async () => {
    const result = await authService.logout();
    removeSignedIn();

    return result;
  }, [removeSignedIn]);

  const resetPassword = useCallback((email: string, redirectTo = window.location.origin) => {
    authService.resetPassword(email, redirectTo);
  }, []);

  return {
    signedIn, setSignedIn, removeSignedIn,
    attemptLogin, attemptRegister, signOut, resetPassword
  } as const;
}