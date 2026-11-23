import { useState, useEffect, useCallback } from "react";
import { userService } from "../service/user_service";
import type { PublicUserDTO } from "@/shared/types/database";

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<PublicUserDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const result = await userService.getById(id);
    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setError("Não foi possível carregar o perfil.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  const updateProfile = useCallback(async (data: { name?: string; bio?: string | null }) => {
    const result = await userService.updateMe(data);
    if (result.success && result.data) {
      setProfile(result.data);
      return true;
    }
    return false;
  }, []);

  return { profile, loading, error, refetch: () => userId && fetchProfile(userId), updateProfile };
}
