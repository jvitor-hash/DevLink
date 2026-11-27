import { useState, useEffect, useCallback } from "react";
import { projectViewService } from "../service/project_view_service";
import type { ProjectFetchListQuery } from "../types/project_fetch_list_query";

export function useProjects(initialQuery: ProjectFetchListQuery = {}) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (query: ProjectFetchListQuery = initialQuery) => {
    setLoading(true);
    setError(null);
    const result = await projectViewService.fetchProjects(query);
    if (result.success && result.data) {
      setProjects(result.data);
    } else {
      setError(result.errors?.message || "Falha ao carregar projetos.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects(initialQuery);
  }, [JSON.stringify(initialQuery), fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
