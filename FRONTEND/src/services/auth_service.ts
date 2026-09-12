import { BASE_URL, type UserDTO, type UserRole } from "@/lib/types/database";
import { cache } from "@/lib/hooks/useCache";

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
  registrationRole: RegisterRole;
}

export interface AuthSessionDTO {
  id: string;
  userId: string;
  expiresAt: string | Date;
  token?: string;
}

export interface AuthResponse {
  user: UserDTO;
  session?: AuthSessionDTO | null;
  token?: string;
}

interface LoginAttempt {
  timestamp: number;
  email: string;
  success: boolean;
}

type ErrorResponse = { message?: string; error?: string };

class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const recentAttempts = this.getRecentAttempts(credentials.email);
    const failedAttempts = recentAttempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      throw new Error(
        `Account locked. Please try again in ${Math.ceil(this.LOCKOUT_DURATION / 60000)} minutes.`,
      );
    }

    try {
      const response = await this.request<AuthResponse>("/api/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      this.cacheUserData(response);
      this.recordLoginAttempt(credentials.email, true);
      this.clearFailedAttempts(credentials.email);
      return response;
    } catch (error) {
      this.recordLoginAttempt(credentials.email, false);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const endpoint = credentials.registrationRole === "CLIENT"
      ? "/api/auth/sign-up/client"
      : "/api/auth/sign-up/programmer";

    const response = await this.request<AuthResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      }),
    });

    this.cacheUserData(response);
    return response;
  }

  async getCurrentUser(): Promise<UserDTO | null> {
    const cachedUser = cache.get<UserDTO>("current_user");
    if (cachedUser) return cachedUser;

    try {
      const response = await this.request<{ user?: UserDTO } | null>("/api/auth/get-session");
      if (!response?.user) return null;
      cache.set("current_user", response.user);
      return response.user;
    } catch {
      return null;
    }
  }

  getCachedUser(): UserDTO | null {
    return cache.get<UserDTO>("current_user") ?? null;
  }

  getAuthToken(): string | null {
    return cache.get<string>("auth_token") ?? null;
  }

  isAuthenticated(): boolean {
    return cache.has("current_user");
  }

  hasPermission(permission: Record<string, string>): boolean {
    const user = this.getCachedUser();
    if (!user) return false;
    if (this.isAdmin(user.role)) return true;
    const allowed = this.request("/admin/has-permission", {
      body: {
        user: user.id,
        permissions: {
          ...permission
        }
      }
    });

    return allowed.success;

    // return permission === "read" && user.role !== null;
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>("/api/auth/sign-out", { method: "POST" });
    } finally {
      cache.delete("current_user");
      cache.delete("auth_token");
      cache.delete("token_expiry");
    }
  }

  async resetPassword(email: string, redirectTo = window.location.origin): Promise<void> {
    await this.request<void>("/api/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email, redirectTo }),
    });
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ErrorResponse | null;
      throw new Error(body?.message ?? body?.error ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  private cacheUserData(response: AuthResponse): void {
    cache.set("current_user", response.user);
    if (response.token) cache.set("auth_token", response.token);
  }

  private getRecentAttempts(email: string): LoginAttempt[] {
    const attempts = cache.get<LoginAttempt[]>(`login_attempts_${email}`) ?? [];
    return attempts.filter((attempt) => Date.now() - attempt.timestamp < this.LOCKOUT_DURATION);
  }

  private recordLoginAttempt(email: string, success: boolean): void {
    const attempts = [...this.getRecentAttempts(email), { timestamp: Date.now(), email, success }].slice(-100);
    cache.set(`login_attempts_${email}`, attempts);
  }

  private clearFailedAttempts(email: string): void {
    cache.delete(`login_attempts_${email}`);
  }

  private isAdmin(role: UserRole | string | null | undefined): boolean {
    return role === "ADMIN" || role === "admin";
  }
}

export const authService = new AuthService();
