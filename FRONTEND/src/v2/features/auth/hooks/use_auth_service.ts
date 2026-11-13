import { useSessionCache } from "@/shared/hooks/use_cache";
import { authService } from "@/features/auth/service/auth_service";

export default function useAuthService() {
  const [signedIn, setSignedIn, removeSignedIn] = useSessionCache("signed-in", "ttttt");
  
}