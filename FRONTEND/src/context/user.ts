import { AuthService, type LoginCredentials, type RegisterCredentials, type Permissions } from "@/data/services/auth_service";
import type { UserDTO } from "@/data/types/database";

// Cached user singleton abstracting the auth service away from the pages.
export class CachedUser {
  private user: UserDTO | null = null;

  private readonly authService = new AuthService();

  getCachedUser() : UserDTO | null {
    if (!this.user) this.user = this.authService.getCachedUser();

    return this.user;
  }

  async getCurrentUser() : Promise<UserDTO | null> {
    this.user = await this.authService.getCurrentUser();

    return this.user;
  }

  async hasPermission(permissions: Permissions) : Promise<boolean> {
    return this.authService.hasPermission(permissions);
  }

  async login({ email, password }: LoginCredentials) : Promise<void> {
    const authResponse = await this.authService.login({ email, password });

    this.user = authResponse.user;
  }

  async register(credentials: RegisterCredentials) : Promise<void> {
    const authResponse = await this.authService.register(credentials);

    this.user = authResponse.user;
  }

  async logout() : Promise<void> {
    await this.authService.logout();

    this.user = null;
  }

  updateUser(data: Partial<UserDTO>) : void {
    this.user = this.authService.updateCachedUser(data) ?? this.user;
  }

  // Validates whether the current cached user is same as the database user.
  async invalidateUser() : Promise<void> {
    this.user = await this.authService.getCurrentUser();
  }

  get isSignedIn() : boolean {
    return this.getCachedUser() !== null;
  }

  get id() : string | undefined {
    return this.getCachedUser()?.id;
  }

  get name() : string | undefined {
    return this.getCachedUser()?.name;
  }

  get email() : string | undefined {
    return this.getCachedUser()?.email;
  }

  get bio() : UserDTO["bio"] {
    return this.getCachedUser()?.bio;
  }

  get role() : UserDTO["role"] {
    return this.getCachedUser()?.role;
  }
}

export const userSingleton = new CachedUser();
