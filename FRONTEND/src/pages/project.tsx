import { ProjectModal } from "@/components/layout/project_modal_layout";
import ProfileCard from "@/components/layout/profile_card_layout";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import Select from "@/components/ui/select_component";
import { authService } from "@/services/auth_service";
import { projectService } from "@/services/project_service";
import { savedTicketService } from "@/services/saved_ticket_service";
import { userService } from "@/services/user_service";
import type { ProjectDTO, PublicUserDTO, ProminentClientDTO } from "@/lib/types/database";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "react-feather";
import { useSearchParams } from "react-router-dom";

export default function ProjectPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<ProjectDTO[] | null>(null);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({});
  const [prominentClients, setProminentClients] = useState<ProminentClientDTO[]>([]);
  const [clientProjectCounts, setClientProjectCounts] = useState<Record<string, number>>({});
  const [userResults, setUserResults] = useState<PublicUserDTO[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // URL params filters.
  const URL_category: string | null = searchParams.get("audience");
  const URL_subCategory: string | null = searchParams.get("primaryLanguage");
  const URL_status: string | null = searchParams.get("status");
  const URL_q: string | null = searchParams.get("q");
  const URL_clientId: string | null = searchParams.get("clientId");

  // Pagination
  const limit: number = Number(searchParams.get("limit")) || 10;
  const offset: number = Number(searchParams.get("offset")) || 0;

  const user = authService.getCachedUser();
  const userId = user?.id ?? null;

  const loadSaved = useCallback(async (): Promise<void> => {
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
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const request_projects = await projectService.list({
          limit,
          offset,
          audience: URL_category ?? undefined,
          primaryLanguage: URL_subCategory ?? undefined,
          status: URL_status ?? undefined,
          q: URL_q ?? undefined,
          clientId: URL_clientId ?? undefined,
        });
        setProjects(request_projects);

        const ids = request_projects.map((project) => project.id);
        if (ids.length) {
          const { counts } = await savedTicketService.countByProjects(ids);
          setSaveCounts(counts);
        } else {
          setSaveCounts({});
        }

        await loadSaved();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os projetos.");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [limit, offset, URL_category, URL_subCategory, URL_status, URL_q, URL_clientId, loadSaved]);

  useEffect(() => {
    const loadProminentClients = async (): Promise<void> => {
      try {
        const clients = await userService.getProminentClients(4);
        setProminentClients(clients);

        if (clients.length) {
          const { counts } = await projectService.countByClients(clients.map((client) => client.id));
          setClientProjectCounts(counts);
        }
      } catch {
        setProminentClients([]);
      }
    };

    loadProminentClients();
  }, []);

  const applyFilters = (): void => {
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

  const search = (): void => {
    const searchInput = (document.querySelector('input[type="search"], form input[name="q"]') as HTMLInputElement)?.value;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput) next.set("q", searchInput);
      else next.delete("q");
      next.delete("clientId");
      return next;
    });
  };

  const searchUsers = async (): Promise<void> => {
    const searchInput = (document.querySelector('input[type="search"], form input[name="q"]') as HTMLInputElement)?.value;

    if (!searchInput) {
      setUserResults(null);
      return;
    }

    try {
      const results = await userService.search(searchInput, undefined, 5);
      setUserResults(results);
    } catch {
      setUserResults([]);
    }
  };

  const toggleSaved = async (projectId: string): Promise<void> => {
    try {
      const isNowSaved = await savedTicketService.toggle(projectId);

      setSavedProjectIds((prev) =>
        isNowSaved ? [...prev, projectId] : prev.filter((id) => id !== projectId)
      );

      setSaveCounts((prev) => ({
        ...prev,
        [projectId]: Math.max(0, (prev[projectId] ?? 0) + (isNowSaved ? 1 : -1)),
      }));
    } catch {
      // ignore for now
    }
  };

  const isSaved = (projectId: string): boolean => savedProjectIds.includes(projectId);

  return (
    <>
      <section>
        <form className="relative mx-25 max-h-fit" onSubmit={(e) => e.preventDefault()}>
          <Input icon="search" label="" name="q" inputType="text" placeholder="Busque por novos projetos ou usuarios..." />
          <div className="absolute right-2 top-8 -translate-y-1/2 flex gap-2">
            <Button label="Usuarios" buttonType="button" colorType="secondary" onClick={searchUsers} />
            <Button label="Pesquisar" buttonType="button" onClick={search} />
          </div>
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
            <Button label="Filtrar" buttonType="button" colorType="secondary" onClick={applyFilters} />
          </div>
        </form>
      </section>

      {/* Prominent clients */}
      <section className="mx-25 mt-8">
        <h2 className="text-lg mb-3"><span className="text-white text-xl">*</span>Clientes em destaque:</h2>
        <div className="flex gap-4 flex-wrap">
          {prominentClients.length === 0 ? (
            <p className="text-sm text-(--text-muted)">Nenhum cliente em destaque.</p>
          ) : (
            prominentClients.map((client) => (
              <ProfileCard
                key={client.id}
                name={client.name}
                bio={client.bio}
                role={client.role ?? "CLIENT"}
                connections={clientProjectCounts[client.id] ?? client.projectCount}
                onClick={() => navigate(`/profile/${client.id}`)}
              />
            ))
          )}
        </div>
      </section>

      {/* User search results */}
      {userResults !== null && (
        <section className="mx-25 mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg mb-3"><span className="text-white text-xl">*</span>Usuarios encontrados:</h2>
            <button type="button" className="text-sm text-(--info) hover:underline" onClick={() => setUserResults(null)}>
              limpar
            </button>
          </div>
          <div className="flex gap-4 flex-wrap">
            {userResults.length === 0 ? (
              <p className="text-sm text-(--text-muted)">Nenhum usuario encontrado.</p>
            ) : (
              userResults.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => navigate(`/profile/${person.id}`)}
                  className="flex items-center gap-3 rounded-md border border-(--border-subtle) bg-(--surface-1) px-4 py-3 hover:cursor-pointer hover:border-(--primary) transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-(--surface-2) flex items-center justify-center font-bold text-(--text-muted)">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-xs text-(--text-muted)">{person.role ?? ""}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      )}

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
                deadline={project.deadline ? String(project.deadline).slice(0, 10) : (project.completedAt ?? "")}
                problem={project.problem ?? ""}
                actions={project.user_actions ?? ""}
                audience={project.audience}
                programming_language={project.primaryLanguage}
                platforms={project.platforms}
                status={project.status}
                maxBudget={project.maxBudget}
                minBudget={project.minBudget}
                saved={isSaved(project.id)}
                saveCount={saveCounts[project.id] ?? 0}
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
