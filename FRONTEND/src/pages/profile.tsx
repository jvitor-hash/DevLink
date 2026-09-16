import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import ProjectPreview from "@/components/ui/project_ticket_component";
import ProfileCard from "@/components/layout/profile_card_layout";
import { authService } from "@/services/auth_service";
import { userService } from "@/services/user_service";
import { projectService } from "@/services/project_service";
import { savedTicketService } from "@/services/saved_ticket_service";
import type { ProjectDTO, PublicUserDTO, ReviewDTO } from "@/lib/types/database";
import { reviewService } from "@/services/review_service";

type FeedPost = {
  id: string;
  kind: "PROJECT" | "REVIEW";
  title: string;
  body: string;
  meta: string;
};

const formatReviewBody = (review: ReviewDTO): string =>
  `${review.rating} estrelas - ${review.description}`;

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();

  const [profileUser, setProfileUser] = useState<PublicUserDTO | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [people, setPeople] = useState<PublicUserDTO[]>([]);
  const [openProjects, setOpenProjects] = useState<ProjectDTO[]>([]);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [saveCounts, setSaveCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadProfileData = useCallback(async (targetId: string): Promise<void> => {
    try {
      const [ownProjects, reviews] = await Promise.all([
        projectService.list({ clientId: targetId, limit: 10 }),
        targetId
          ? reviewService.listReceivedByUser(targetId, { limit: 10 }).catch(() => [])
          : Promise.resolve([]),
      ]);

      const posts: FeedPost[] = [];

      for (const project of ownProjects) {
        posts.push({
          id: `project-${project.id}`,
          kind: "PROJECT",
          title: project.title,
          body: project.description,
          meta: `Projeto - ${project.category} - R$ ${project.minBudget} a R$ ${project.maxBudget}`,
        });
      }

      for (const entry of reviews) {
        posts.push({
          id: `review-${entry.review.id}`,
          kind: "REVIEW",
          title: entry.project?.title ? `Avaliacao em ${entry.project.title}` : "Avaliacao recebida",
          body: formatReviewBody(entry.review),
          meta: `Por ${entry.reviewer?.name ?? "usuario"}`,
        });
      }

      posts.sort((a, b) => a.id.localeCompare(b.id));
      setFeed(posts);
    } catch {
      setFeed([]);
    }
  }, []);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = authService.getCachedUser();
        const targetId = userId ?? cached?.id;

        if (!targetId) {
          setError("Usuario nao encontrado.");
          return;
        }

        const user = targetId === cached?.id && cached ? cached : await userService.getById(targetId);

        if (!user || user.id !== targetId) {
          setError("Perfil nao encontrado.");
          return;
        }

        setProfileUser(user);
        await loadProfileData(targetId);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, loadProfileData]);

  useEffect(() => {
    const loadSidebars = async (): Promise<void> => {
      const [peopleResult, projectsResult] = await Promise.all([
        userService.search(undefined, undefined, 5).catch(() => []),
        projectService.list({ status: "OPEN", limit: 5 }).catch(() => []),
      ]);

      setPeople(peopleResult);
      setOpenProjects(projectsResult);
      await refreshSaveCounts(projectsResult);
    };

    loadSidebars();
  }, []);

  useEffect(() => {
    const loadSaved = async (): Promise<void> => {
      const cached = authService.getCachedUser();
      if (!cached) {
        setSavedProjectIds([]);
        return;
      }

      try {
        const { savedProjectIds: ids } = await savedTicketService.getSavedProjectIdsByUser(cached.id);
        setSavedProjectIds(ids);
      } catch {
        setSavedProjectIds([]);
      }
    };

    loadSaved();
  }, []);

  const refreshSaveCounts = async (projects: ProjectDTO[]): Promise<void> => {
    if (!projects.length) {
      setSaveCounts({});
      return;
    }

    try {
      const { counts } = await savedTicketService.countByProjects(projects.map((project) => project.id));
      setSaveCounts(counts);
    } catch {
      setSaveCounts({});
    }
  };

  const searchOpenProjects = async (): Promise<void> => {
    try {
      const results = await projectService.list({ status: "OPEN", q: search || undefined, limit: 10 });
      setOpenProjects(results);
      await refreshSaveCounts(results);
    } catch {
      setOpenProjects([]);
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
      // Ignore toggle failures.
    }
  };

  if (isLoading) {
    return <div className="p-8 text-(--text-muted)">Carregando perfil...</div>;
  }

  if (error) {
    return <div className="p-8 text-(--error)">{error}</div>;
  }

  if (!profileUser) return null;

  const isOwnProfile = authService.getCachedUser()?.id === profileUser.id;

  return (
    <div className="p-8 grid grid-cols-[1fr_320px] gap-6 items-start">
      {/* Main column */}
      <div className="flex flex-col gap-6">
        <ProfileCard
          name={profileUser.name}
          bio={profileUser.bio}
          role={profileUser.role ?? "CLIENT"}
          connections={500}
        />

        {!isOwnProfile && (
          <Button label="Ver projetos" colorType="primary" buttonType="button" href={`/project?clientId=${profileUser.id}`} />
        )}

        {/* Feed */}
        <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
          <h2 className="text-lg mb-3">Atividades</h2>

          {feed.length === 0 ? (
            <p className="text-(--text-muted) py-6 text-center">Nenhuma atividade recente.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {feed.map((post) => (
                <li key={post.id} className="rounded border border-(--border-subtle) bg-(--surface-2) p-4">
                  <p className="text-xs text-(--text-muted)">{post.meta}</p>
                  <p className="font-semibold mt-1">{post.title}</p>
                  <p className="text-sm text-(--text-secondary) mt-1">{post.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        {/* Open projects search */}
        <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
          <h2 className="text-lg mb-3">Projetos abertos</h2>

          <div className="flex flex-col gap-2">
            <Input
              label=""
              name="profileProjectSearch"
              inputType="text"
              placeholder="Buscar projetos abertos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button label="Buscar" buttonType="button" colorType="secondary" onClick={searchOpenProjects} />
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {openProjects.length === 0 ? (
              <li className="text-sm text-(--text-muted)">Nenhum projeto aberto encontrado.</li>
            ) : (
              openProjects.map((project) => (
                <ProjectPreview
                  key={project.id}
                  item={project.id}
                  title={project.title}
                  category={project.category}
                  deadline={project.deadline ? String(project.deadline).slice(0, 10) : ""}
                  problem={project.problem ?? ""}
                  actions={project.user_actions ?? ""}
                  audience={project.audience}
                  programming_language={project.primaryLanguage}
                  platforms={project.platforms}
                  status={project.status}
                  maxBudget={project.maxBudget}
                  minBudget={project.minBudget}
                  saved={savedProjectIds.includes(project.id)}
                  saveCount={saveCounts[project.id] ?? 0}
                  onToggleSaved={() => toggleSaved(project.id)}
                />
              ))
            )}
          </ul>
        </section>

        {/* People list */}
        <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
          <h2 className="text-lg mb-3">Pessoas</h2>

          <ul className="flex flex-col gap-3">
            {people.length === 0 ? (
              <li className="text-sm text-(--text-muted)">Ninguem encontrado.</li>
            ) : (
              people.map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{person.name}</p>
                    <p className="text-xs text-(--text-muted) truncate">{person.bio ?? person.role ?? ""}</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-(--info) hover:underline shrink-0"
                    onClick={() => navigate(`/profile/${person.id}`)}
                  >
                    Ver
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
