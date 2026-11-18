import { useState, useEffect, useCallback } from "react";
import { userPreferenceService } from "../service/user_preference_service";
import type { UserPreferenceDTO, UserPreferenceUpdate } from "@/shared/types/database";
import { toast } from "@/shared/utils/toast_store";

export function useUserPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<UserPreferenceDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const result = await userPreferenceService.getByUser(userId);
    if (result.success) {
      setPreferences(result.data);
    } else {
      setError("Erro ao carregar preferências");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (data: UserPreferenceUpdate) => {
      if (!userId) return false;
      const result = await userPreferenceService.updateByUser(userId, data);
      if (result.success && result.data) {
        setPreferences(result.data);
        toast.success("Preferências salvas com sucesso!");
        return true;
      } else {
        toast.error("Erro ao salvar preferências.");
        return false;
      }
    },
    [userId]
  );

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
