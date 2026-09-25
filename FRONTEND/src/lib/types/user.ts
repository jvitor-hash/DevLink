import { AuthService } from "@/services/auth_service";
import type { UserDTO } from "./database";

// Cached user singleton
export class CachedUser {
  private user: UserDTO | null = null;
  private authService = new AuthService();

  async login({ email, password }) {
    const authResponse = await this.authService.login({ email, password });
    this.user = authResponse.user;
  }

  async register({ name, email, password, registrationRole }) {
    const authResponse = await this.authService.register({
      name,
      email,
      password,
      registrationRole,
    });
    this.user = authResponse.user;
  }

  async logout() {
    await this.authService.logout();
    this.user = null;
  }

  async updateUser(data: Partial<UserDTO>) {
    await this.authService.updateCachedUser(data);
  }

  // Validates whether the current cached user is same as the database user.
  async invalidateUser(): Promise<void> {
    const currentUser = await this.authService.getCurrentUser();

    if (!this.user && this.user !== currentUser) this.user = currentUser;
  }

  isSignedIn(): boolean {
    if (this.user) return true;
    return false;
  }

  get id(): string {
    return this.user?.id;
  }

  get name(): string {
    return this.user?.name;
  }

  get email(): string {
    return this.user?.email;
  }

  get bio(): string {
    return this.user?.bio;
  }

  get role(): string {
    return this.user?.role;
  }

  get;
}

export const userSingleton = new CachedUser();
