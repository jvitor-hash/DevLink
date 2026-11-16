import { AuthServiceInterface } from "@/features/auth/types/auth_service_interface";
import { APIClient } from "@/shared/utils/api_client";
import { redirectTo } from "@/shared/utils/page_redirecting";

class AuthService {
  async login(credentials: any): Promise<AuthServiceInterface> {
    try {
      const status = await APIClient.post<void>("api/auth/sign-in/", { ...credentials });
      
      if (status === undefined)
        return { success: false, data: null, errors: new Error("Login attempt is undefined") };
      else
        return { success: true, data: status, errors: null };

    } catch (error) {
      return { success: false, data: null, errors: {error} };
    }
  }

  async register(credentials: any, role: "CLIENT" | "PROGRAMMER"): Promise<AuthServiceInterface> {
    const endpoint_role_type = role === "CLIENT" ? "api/auth/sign-up/client" : "api/auth/sign-up/programmer";
    
    try {
      const register_result = await APIClient.post<void>(endpoint_role_type, { ...credentials });
      return { success: true, data: register_result, errors: null};
    } catch (error) {
      return { success: false, data: null, errors: {error} };
    }
  }

  async logout(): Promise<AuthServiceInterface> {
    try {
      await APIClient.post<void>("api/auth/sign-out/", {});
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: {error} };
    }
  }

  async resetPassword(email: string, redirectToPath = window.location.origin): Promise<AuthServiceInterface> {
    try {
      await APIClient.post<void>("/api/auth/request-password-reset", { email, redirectTo });
      redirectTo(redirectToPath);
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: {error} };
    }
  }
}

export const authService = new AuthService();