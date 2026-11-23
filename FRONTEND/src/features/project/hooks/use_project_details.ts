import { useState, useEffect, useCallback } from "react";
import { projectViewService } from "../service/project_view_service";
import type { ProjectDTO } from "@/shared/types/database";

export function useProjectDetails(projectId?: string) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(projectId));
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const result = await projectViewService.fetchProjectById(id);
    if (result.success && result.data) {
      setProject(result.data);
    } else {
      setError(result.errors?.message || "Projeto não encontrado.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  return { project, loading, error, refetch: () => projectId && fetchProject(projectId) };
}
