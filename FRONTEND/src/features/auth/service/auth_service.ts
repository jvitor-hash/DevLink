import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import { APIClient } from "@/shared/utils/api_client";
import { redirectTo } from "@/shared/utils/page_redirecting";

class AuthService {
  async login(credentials: { email: string; password: string }): Promise<ServiceRequestInterface> {
    try {
      const response = await APIClient.post<any>("/api/auth/sign-in/email", credentials);

      if (!response) {
        return { success: false, data: null, errors: new Error("Falha ao autenticar usuário") };
      }

      return { success: true, data: response, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async register(credentials: any, role: "CLIENT" | "PROGRAMMER"): Promise<ServiceRequestInterface> {
    const endpoint = role === "CLIENT" ? "/api/auth/sign-up/client" : "/api/auth/sign-up/programmer";

    try {
      const response = await APIClient.post<any>(endpoint, {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      if (!response) {
        return { success: false, data: null, errors: new Error("Falha ao registrar usuário") };
      }

      return { success: true, data: response, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async logout(): Promise<ServiceRequestInterface> {
    try {
      await APIClient.post<void>("/api/auth/sign-out", {});
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getCurrentSession(): Promise<ServiceRequestInterface> {
    try {
      const response = await APIClient.get<any>("/api/auth/get-session");
      if (!response || !response.user) {
        return { success: false, data: null, errors: new Error("Nenhuma sessão ativa") };
      }
      return { success: true, data: response, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async resetPassword(email: string, redirectToPath = window.location.origin): Promise<ServiceRequestInterface> {
    try {
      await APIClient.post<void>("/api/auth/forget-password", { email, redirectTo: redirectToPath });
      redirectTo(redirectToPath);
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }
}

export const authService = new AuthService();
