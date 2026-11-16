import { createContext, useContext } from "react";
import useAuthService from "../hooks/use_auth_service";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }) {
  const {signedIn, attemptLogin, attemptRegister, signOut, resetPassword} = useAuthService();

  return (
    <AuthContext.Provider value={{signedIn, attemptLogin, attemptRegister, signOut, resetPassword}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext);
}