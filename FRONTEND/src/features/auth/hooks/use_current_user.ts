import { useAuthContext } from "@/features/auth/components/auth_provider";
import type { UserDTO } from "@/shared/types/database";

export function useCurrentUser(): UserDTO | null {
  const context = useAuthContext();
  return context?.signedIn ?? null;
}
