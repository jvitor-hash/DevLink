import { APIClient } from "@/shared/utils/api_client";

class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000;
  private attempts = 0;

  async login(credentials: any) {

  }

  async register(credentials: any) {

  }

  async logout() {

  }

  async resetPassword(email: string, redirectTo = window.location.origin) {

  }

  private clearFailedAttempts(email: string) : void {
    this.attempts = 0;
  }
}

export const authService = new AuthService();