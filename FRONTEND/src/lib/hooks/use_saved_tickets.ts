import { useCallback, useEffect, useState } from "react";

import { authService } from "@/services/auth_service";
import { savedTicketService } from "@/services/saved_ticket_service";

interface UseSavedTicketsResult {
  savedProjectIds: string[];
  saveCounts: Record<string, number>;
  setSaveCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isSaved: (projectId: string) => boolean;
  toggleSaved: (projectId: string) => Promise<void>;
  setSaveCountsFromProjects: (projects: Array<{ id: string; saveTotalCount?: number | null }>) => void;
}

// Shared saved-tickets state used by the project list and profile page.
export function useSavedTickets(loadProjectsOnMount: boolean = true) : UseSavedTicketsResult {
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loadProjectsOnMount) return;

    const loadSaved = async () : Promise<void> => {
      const user = authService.getCachedUser();

      if (!user) {
        setSavedProjectIds([]);
        return;
      }

      try {
        const { savedProjectIds: ids } = await savedTicketService.getSavedProjectIdsByUser(user.id);
        setSavedProjectIds(ids);
      } catch {
        setSavedProjectIds([]);
      }
    };

    void loadSaved();
  }, [loadProjectsOnMount]);

  const isSaved = useCallback(
    (projectId: string) : boolean => savedProjectIds.includes(projectId),
    [savedProjectIds],
  );

  const toggleSaved = useCallback(async (projectId: string) : Promise<void> => {
    // Only programmers can save projects; the API enforces this as well.
    if (authService.getCachedUser()?.role !== "PROGRAMMER") return;

    try {
      const isNowSaved = await savedTicketService.toggle(projectId);

      setSavedProjectIds((prev) =>
        isNowSaved ? [...prev, projectId] : prev.filter((id) => id !== projectId),
      );

      setSaveCounts((prev) => ({
        ...prev,
        [projectId]: Math.max(0, (prev[projectId] ?? 0) + (isNowSaved ? 1 : -1)),
      }));
    } catch {
      // Ignore toggle failures.
    }
  }, []);

  const setSaveCountsFromProjects = useCallback(
    (projects: Array<{ id: string; saveTotalCount?: number | null }>) : void => {
      setSaveCounts(Object.fromEntries(projects.map((project) => [project.id, project.saveTotalCount ?? 0])));
    },
    [],
  );

  return {
    savedProjectIds,
    saveCounts,
    setSaveCounts,
    isSaved,
    toggleSaved,
    setSaveCountsFromProjects,
  };
}
