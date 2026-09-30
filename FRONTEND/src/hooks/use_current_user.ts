import { useSyncExternalStore } from "react";

import { userSingleton } from "@/context/user";
import type { UserDTO } from "@/data/types/database";

// Reactive view of the authenticated user; re-renders the caller whenever
// login, register, logout or profile updates change the singleton.
export function useCurrentUser() : UserDTO | null {
  return useSyncExternalStore(
    userSingleton.subscribe,
    () => userSingleton.getCachedUser(),
  );
}
