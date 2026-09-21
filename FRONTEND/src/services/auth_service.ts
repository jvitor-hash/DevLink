import { apiClient } from "@/lib/api_client";
import { cache, CACHE_KEYS } from "@/lib/utils/session_cache";
import type { UserDTO, UserRole } from "@/lib/types/database";

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

export interface AuthResponse {
  user: UserDTO;
  session?: {
    id: string;
    userId: string;
    expiresAt: string | Date;
  } | null;
}

export const permissionStatement = {
  projects: ["create", "update", "read", "delete", "list"],
  message: ["create", "update", "read", "delete", "list"],
  notification: ["create", "update", "read", "delete", "list"],
  reviews: ["create", "update", "read", "delete", "list"],
  saved_tickets: ["create", "update", "read", "delete", "list"],
  user_preferences: ["create", "update", "read", "delete", "list"],
} as const;

export type Permissions = Partial<{
  [K in keyof typeof permissionStatement]: readonly ((typeof permissionStatement)[K][number])[];
}>;

interface LoginAttempt {
  timestamp: number;
  email: string;
  success: boolean;
}

class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000;

  async login(credentials: LoginCredentials) : Promise<AuthResponse> {
    const recentAttempts = this.getRecentAttempts(credentials.email);
    const failedAttempts = recentAttempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      throw new Error(
        `Account locked. Please try again in ${Math.ceil(this.LOCKOUT_DURATION / 60000)} minutes.`,
      );
    }

    try {
      const response = await apiClient.post<AuthResponse>("/api/auth/sign-in/email", credentials);

      this.cacheUserData(response);
      this.recordLoginAttempt(credentials.email, true);
      this.clearFailedAttempts(credentials.email);

      return response;
    } catch (error) {
      this.recordLoginAttempt(credentials.email, false);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials) : Promise<AuthResponse> {
    const endpoint = credentials.registrationRole === "CLIENT"
      ? "/api/auth/sign-up/client"
      : "/api/auth/sign-up/programmer";

    const response = await apiClient.post<AuthResponse>(endpoint, {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    });

    this.cacheUserData(response);

    return response;
  }

  async getCurrentUser() : Promise<UserDTO | null> {
    const cachedUser = cache.get<UserDTO>(CACHE_KEYS.CURRENT_USER);

    if (cachedUser) return cachedUser;

    try {
      const response = await apiClient.get<{ user?: UserDTO } | null>("/api/auth/get-session");

      if (!response?.user) return null;

      cache.set(CACHE_KEYS.CURRENT_USER, response.user);

      return response.user;
    } catch {
      return null;
    }
  }

  getCachedUser() : UserDTO | null {
    return cache.get<UserDTO>(CACHE_KEYS.CURRENT_USER) ?? null;
  }

  /** Merge fields into the cached user after profile updates. */
  updateCachedUser(patch: Partial<UserDTO>) : UserDTO | null {
    const current = this.getCachedUser();

    if (!current) return null;

    const next = { ...current, ...patch };
    cache.set(CACHE_KEYS.CURRENT_USER, next);

    return next;
  }

  isAuthenticated() : boolean {
    return cache.has(CACHE_KEYS.CURRENT_USER);
  }

  async hasPermission(permissions: Permissions) : Promise<boolean> {
    const user = this.getCachedUser();

    if (!user) return false;
    if (this.isAdmin(user.role)) return true;

    const allowed = await apiClient.post<{ success: boolean; error: string | null }>(
      "/api/auth/admin/has-permission",
      { permissions: { ...permissions } },
    );

    return allowed?.success ?? false;
  }

  async logout() : Promise<void> {
    try {
      await apiClient.post<void>("/api/auth/sign-out", {});
    } finally {
      cache.delete(CACHE_KEYS.CURRENT_USER);
      // Scrub legacy token keys from before tokens stopped being persisted.
      cache.delete(CACHE_KEYS.AUTH_TOKEN);
      cache.delete(CACHE_KEYS.TOKEN_EXPIRY);
    }
  }

  async resetPassword(email: string, redirectTo = window.location.origin) : Promise<void> {
    await apiClient.post<void>("/api/auth/request-password-reset", { email, redirectTo });
  }

  private cacheUserData(response: AuthResponse) : void {
    cache.set(CACHE_KEYS.CURRENT_USER, response.user);
  }

  private getRecentAttempts(email: string) : LoginAttempt[] {
    const attempts = cache.get<LoginAttempt[]>(`login_attempts_${email}`) ?? [];
    return attempts.filter((attempt) => Date.now() - attempt.timestamp < this.LOCKOUT_DURATION);
  }

  private recordLoginAttempt(email: string, success: boolean) : void {
    const attempts = [...this.getRecentAttempts(email), { timestamp: Date.now(), email, success }].slice(-100);
    cache.set(`login_attempts_${email}`, attempts);
  }

  private clearFailedAttempts(email: string) : void {
    cache.delete(`login_attempts_${email}`);
  }

  private isAdmin(role: UserRole | string | null | undefined) : boolean {
    return role === "ADMIN" || role === "admin";
  }
}

export const authService = new AuthService();
