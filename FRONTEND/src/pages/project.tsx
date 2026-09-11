import { ProjectModal } from "@/components/layout/project_modal_layout";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import Select from "@/components/ui/select_component";
import { authService } from "@/services/auth_service";
import { projectService } from "@/services/project_service";
import { savedTicketService } from "@/services/saved_ticket_service";
import type { ProjectDTO } from "@/lib/types/database";
import { Suspense, useEffect, useState, useCallback } from "react";
import { ChevronRight } from "react-feather";
import { useSearchParams } from "react-router-dom";

export default function ProjectPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectDTO[] | null>(null);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL params filters.
  const URL_category: string | null = searchParams.get("category");
  const URL_subCategory: string | null = searchParams.get("sub_category");

  // Pagination
  const limit: number | null = Number(searchParams.get("limit"));
  const offset: number | null = Number(searchParams.get("offset"));

  const user = authService.getCachedUser();
  const userId = user?.id ?? null;

  const loadSaved = useCallback(async () => {
    if (!userId) {
      setSavedProjectIds([]);
      return;
    }
    try {
      const { savedProjectIds: ids } = await savedTicketService.getSavedProjectIdsByUser(userId);
      setSavedProjectIds(ids);
    } catch {
      setSavedProjectIds([]);
    }
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const request_projects = await projectService.list({
          limit: limit || 10,
          offset: offset || 0,
          audience: URL_category ?? undefined,
          primaryLanguage: URL_subCategory ?? undefined,
        });
        setProjects(request_projects);
        await loadSaved();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os projetos.");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [limit, offset, URL_category, URL_subCategory]);

  const applyFilters = async () => {
    const audience = (document.querySelector('select[name="audience"]') as HTMLSelectElement)?.value || "ALL";
    const platforms = (document.querySelector('select[name="platforms"]') as HTMLSelectElement)?.value || "ALL";
    const primaryLanguage = (document.querySelector('select[name="primary_language"]') as HTMLSelectElement)?.value || "ALL";
    const status = (document.querySelector('select[name="status"]') as HTMLSelectElement)?.value || "ALL";
    const minBudget = (document.querySelector('input[name="minBudget"]') as HTMLInputElement)?.value || "";
    const maxBudget = (document.querySelector('input[name="maxBudget"]') as HTMLInputElement)?.value || "";
    const savedOnly = document.querySelector('input[name="savedOnly"]') as HTMLInputElement;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (audience !== "ALL") next.set("audience", audience); else next.delete("audience");
      if (platforms !== "ALL") next.set("platforms", platforms); else next.delete("platforms");
      if (primaryLanguage !== "ALL") next.set("primaryLanguage", primaryLanguage); else next.delete("primaryLanguage");
      if (status !== "ALL") next.set("status", status); else next.delete("status");
      if (minBudget) next.set("minBudget", minBudget); else next.delete("minBudget");
      if (maxBudget) next.set("maxBudget", maxBudget); else next.delete("maxBudget");
      if (savedOnly?.checked) next.set("savedOnly", "true"); else next.delete("savedOnly");
      return next;
    });
  };

  const toggleSaved = async (projectId: string) => {
    try {
      await savedTicketService.toggle(projectId);
      await loadSaved();
    } catch {
      // ignore for now
    }
  };

  const isSaved = (projectId: string) => savedProjectIds.includes(projectId);

  return (
    <>
      <section>
        <form className="relative mx-25 max-h-fit" onSubmit={(e) => e.preventDefault()}>
          <Input icon="search" label="" inputType="text" placeholder="Busque por novos projetos..." />
          <Button className="absolute right-2 top-8 -translate-y-1/2" label="Pesquisar" buttonType="button" onClick={applyFilters} />
          {/* Filters */}
          <div className="flex gap-10 mt-4">
            <p>Público-alvo:</p>
            <p>Plataformas:</p>
            <p>Linguagem:</p>
            <p>Status:</p>
            <p>Orçamento:</p>
          </div>
          <div className="flex gap-10 mt-2">
            <Select labels={{ "Todos": "ALL", "Clientes": "CLIENTS", "Ferramenta Interna": "INTERNAL_TOOL" }} name="audience" />
            <Select labels={{ "Todas": "ALL", Web: "WEB", Desktop: "DESKTOP", Mobile: "MOBILE" }} name="platforms" />
            <Select labels={{ "Todas": "ALL", Python: "PYTHON", Typescript: "TYPESCRIPT", "C#": "CSHARP" }} name="primary_language" />
            <Select labels={{ "Todas": "ALL", "Em-aberto": "OPEN", Negociação: "NEGOTIATING", "Em desenvolvimento": "IN_DEVELOPMENT", "Concluído": "COMPLETED", Cancelado: "CANCELLED" }} name="status" />
            <Input name="minBudget" placeholder="R$ 000" inputType="number" label="" />
            <Input name="maxBudget" placeholder="R$ 000" inputType="number" label="" />
            <Select labels={{ "Sem filtro": "ALL", "Apenas salvos": "SAVED" }} name="savedOnly" />
          </div>
        </form>
      </section>

      <section className="mx-25">
        <div className="mb-5 mt-5">
          <div className="flex justify-between">
            <h1 className="text-2xl text-(--text-primary) mb-3"><span className="text-white text-3xl">*</span>Highlights desta semana:</h1>
            <button className="group flex items-center hover:cursor-pointer">Ver mais<ChevronRight className="inline transition-all group-hover:mx-2" /></button>
          </div>
          <div className="border-b border-b-(--error)"></div>
        </div>
        <div className="grid">
          {isLoading && !projects ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="text-(--error)">{error}</p>
          ) : projects && projects.length ? (
            projects.map((project) => (
              <ProjectPreview
                item={project.id}
                title={project.title}
                category={project.category}
                deadline={project.completedAt}
                problem={project.problem}
                actions={project.user_actions}
                audience={project.audience}
                programming_language={project.primaryLanguage}
                platforms={project.platforms}
                status={project.status}
                maxBudget={project.maxBudget}
                minBudget={project.minBudget}
                saved={isSaved(project.id)}
                onToggleSaved={() => toggleSaved(project.id)}
                key={project.id}
              />
            ))
          ) : (
            <p className="text-(--text-muted)">Nenhum projeto encontrado.</p>
          )}
        </div>
      </section>

      <Suspense fallback={null}>
        <ProjectModal />
      </Suspense>
    </>
  );
}
