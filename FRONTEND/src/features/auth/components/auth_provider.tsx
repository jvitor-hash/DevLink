import { createContext, useContext, type ReactNode } from "react";
import useAuthService from "../hooks/use_auth_service";

const AuthContext = createContext<ReturnType<typeof useAuthService> | null>(null);

export function AuthProvider({ children }: { children?: ReactNode }) {
  const auth = useAuthService();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
