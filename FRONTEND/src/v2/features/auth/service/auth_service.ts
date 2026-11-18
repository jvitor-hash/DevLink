import type { ServiceRequestInterface } from "@/shared/types/service_request_interface";
import { APIClient } from "@/shared/utils/api_client";
import { redirectTo } from "@/shared/utils/page_redirecting";
import type { UserDTO } from "@/shared/types/database";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type RegisterRole = "CLIENT" | "PROGRAMMER";

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: RegisterRole;
}

export interface AuthSessionResponse {
  user: UserDTO;
  session?: {
    id: string;
    userId: string;
    expiresAt: string | Date;
  } | null;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ServiceRequestInterface<AuthSessionResponse>> {
    try {
      const response = await APIClient.post<AuthSessionResponse>("/api/auth/sign-in/email", { ...credentials });

      if (!response) {
        return { success: false, data: null, errors: new Error("Falha ao autenticar usuário") };
      }

      return { success: true, data: response, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async register(credentials: RegisterCredentials, role: RegisterRole = "CLIENT"): Promise<ServiceRequestInterface<AuthSessionResponse>> {
    const endpoint = role === "CLIENT" ? "/api/auth/sign-up/client" : "/api/auth/sign-up/programmer";

    try {
      const response = await APIClient.post<AuthSessionResponse>(endpoint, {
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

  async logout(): Promise<ServiceRequestInterface<null>> {
    try {
      await APIClient.post<void>("/api/auth/sign-out", {});
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async getCurrentSession(): Promise<ServiceRequestInterface<AuthSessionResponse>> {
    try {
      const response = await APIClient.get<AuthSessionResponse>("/api/auth/get-session");
      if (!response) {
        return { success: false, data: null, errors: new Error("Sessão não encontrada") };
      }
      return { success: true, data: response, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async resetPassword(email: string, redirectToPath = window.location.origin): Promise<ServiceRequestInterface<null>> {
    try {
      await APIClient.post<void>("/api/auth/request-password-reset", { email, redirectTo: redirectToPath });
      redirectTo(redirectToPath);
      return { success: true, data: null, errors: null };
    } catch (error) {
      return { success: false, data: null, errors: error };
    }
  }

  async hasPermission(permissions: Record<string, string[]>): Promise<ServiceRequestInterface<boolean>> {
    try {
      const allowed = await APIClient.post<{ success: boolean; error: string | null }>(
        "/api/auth/admin/has-permission",
        { permissions }
      );
      return { success: true, data: allowed?.success ?? false, errors: null };
    } catch (error) {
      return { success: false, data: false, errors: error };
    }
  }
}

export const authService = new AuthService();
