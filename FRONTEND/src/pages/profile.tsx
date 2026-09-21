import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/ui/button_component";
import Input from "@/components/ui/input_component";
import { authService } from "@/services/auth_service";
import { userService } from "@/services/user_service";
import { projectService } from "@/services/project_service";
import type {
  ProjectDTO,
  PublicUserDTO,
} from "@/lib/types/database";
import { reviewService } from "@/services/review_service";
import { formatRelativeTime } from "@/lib/utils/relative_time";

type FeedTab = "ACTIVITY" | "PROJECTS" | "REVIEWS";

type FeedPost = {
  id: string;
  kind: "PROJECT" | "REVIEW";
  title: string;
  body: string;
  meta: string;
  createdAt: string | Date | null | undefined;
};

const FEED_TABS: Array<{ key: FeedTab; label: string }> = [
  { key: "ACTIVITY", label: "Atividades" },
  { key: "PROJECTS", label: "Projetos" },
  { key: "REVIEWS", label: "Avaliações" },
];

const toEpoch = (value: string | Date | null | undefined): number => {
  if (!value) return 0;

  const epoch = new Date(value).getTime();
  return Number.isNaN(epoch) ? 0 : epoch;
};

const roleBadge = (role: string | null | undefined): { label: string; className: string } =>
  role === "PROGRAMMER"
    ? { label: "PROGRAMMER", className: "bg-(--info)" }
    : role === "ADMIN"
      ? { label: "ADMIN", className: "bg-(--primary)" }
      : { label: "CLIENT", className: "bg-(--success)" };

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();

  const [profileUser, setProfileUser] = useState<PublicUserDTO | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [people, setPeople] = useState<PublicUserDTO[]>([]);
  const [openProjects, setOpenProjects] = useState<ProjectDTO[]>([]);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FeedTab>("ACTIVITY");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadProfileData = useCallback(
    async (targetId: string): Promise<void> => {
      try {
        const [ownProjects, reviews] = await Promise.all([
          projectService.list({ clientId: targetId, limit: 10 }),
          targetId
            ? reviewService
                .listReceivedByUser(targetId, { limit: 10 })
                .catch(() => [])
            : Promise.resolve([]),
        ]);

        const posts: FeedPost[] = [];

        for (const project of ownProjects) {
          posts.push({
            id: `project-${project.id}`,
            kind: "PROJECT",
            title: project.title,
            body: project.description,
            meta: `Projeto · ${project.category} · R$ ${project.minBudget} a R$ ${project.maxBudget}`,
            createdAt: project.createdAt,
          });
        }

        for (const entry of reviews) {
          posts.push({
            id: `review-${entry.review.id}`,
            kind: "REVIEW",
            title: entry.project?.title
              ? `Avaliação em ${entry.project.title}`
              : "Avaliação recebida",
            body: `"${entry.review.description}"`,
            meta: `Avaliação · ${"★".repeat(Math.max(1, Math.min(5, entry.review.rating)))} · Por ${entry.reviewer?.name ?? "usuário"}`,
            createdAt: entry.review.createdAt,
          });
        }

        // Chronological order: newest first (was sorted by id before).
        posts.sort((a, b) => toEpoch(b.createdAt) - toEpoch(a.createdAt));
        setFeed(posts);
      } catch {
        setFeed([]);
      }
    },
    [],
  );

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = authService.getCachedUser();
        const targetId = userId ?? cached?.id;

        if (!targetId) {
          setError("Usuário não encontrado.");
          return;
        }

        const user =
          targetId === cached?.id && cached
            ? cached
            : await userService.getById(targetId);

        if (!user || user.id !== targetId) {
          setError("Perfil não encontrado.");
          return;
        }

        setProfileUser(user);
        await loadProfileData(targetId);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o perfil.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, loadProfileData]);

  // Sidebar data; declared before use so the hooks lint rule can track it.
  const loadSidebars = useCallback(async (): Promise<void> => {
    const [peopleResult, projectsResult] = await Promise.all([
      userService.search(undefined, undefined, 5).catch(() => []),
      projectService.list({ status: "OPEN", limit: 5 }).catch(() => []),
    ]);

    setPeople(peopleResult);
    setOpenProjects(projectsResult);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSidebars();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSidebars]);

  const searchOpenProjects = async (): Promise<void> => {
    try {
      const results = await projectService.list({
        status: "OPEN",
        q: search || undefined,
        limit: 10,
      });
      setOpenProjects(results);
    } catch {
      setOpenProjects([]);
    }
  };

  const visibleFeed = useMemo(
    (): FeedPost[] =>
      feed.filter((post) => {
        if (activeTab === "PROJECTS") return post.kind === "PROJECT";
        if (activeTab === "REVIEWS") return post.kind === "REVIEW";
        return true;
      }),
    [feed, activeTab],
  );

  if (isLoading) {
    return <div className="p-8 text-(--text-muted)">Carregando perfil...</div>;
  }

  if (error) {
    return <div className="p-8 text-(--error)">{error}</div>;
  }

  if (!profileUser) return null;

  const isOwnProfile = authService.getCachedUser()?.id === profileUser.id;
  const badge = roleBadge(profileUser.role);

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Full-width profile header */}
      <section className="flex flex-col gap-6 rounded-md border border-(--border-subtle) bg-(--surface-1) p-6 sm:flex-row sm:items-center">
        {profileUser.image ? (
          <img
            src={profileUser.image}
            alt={profileUser.name}
            className="h-18 w-18 shrink-0 rounded-full border border-(--border-subtle) object-cover"
          />
        ) : (
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-2) text-2xl font-bold text-(--text-muted)">
            {profileUser.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-(--text-primary)">{profileUser.name}</h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {profileUser.bio ? (
            <p className="mt-2 line-clamp-2 text-sm text-(--text-secondary)">{profileUser.bio}</p>
          ) : (
            <p className="mt-2 text-sm italic text-(--text-muted)">Sem bio ainda.</p>
          )}
        </div>

        {/* Conditional actions: owner edits, visitor starts a conversation */}
        <div className="flex shrink-0 gap-2">
          {isOwnProfile ? (
            <Button label="Editar perfil" buttonType="button" colorType="primary" href="/settings" />
          ) : (
            <Button label="Mensagem" buttonType="button" colorType="secondary" onClick={() => navigate("/project")} />
          )}
        </div>
      </section>

      {/* Feed tabs */}
      <nav className="flex gap-2">
        {FEED_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-md border px-4 py-1.5 text-sm transition-colors hover:cursor-pointer ${
              activeTab === key
                ? "border-(--primary) bg-(--primary) text-white"
                : "border-(--border-subtle) bg-(--surface-1) text-(--text-secondary) hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Main 2-col: feed + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Feed */}
        <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
          <h2 className="text-lg mb-3">{FEED_TABS.find((tab) => tab.key === activeTab)?.label}</h2>

          {visibleFeed.length === 0 ? (
            <p className="text-(--text-muted) py-6 text-center">
              Nenhuma atividade recente.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleFeed.map((post) => (
                <li
                  key={post.id}
                  className="rounded border border-(--border-subtle) bg-(--surface-2) p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-(--text-muted)">{post.meta}</p>
                    <p className="shrink-0 text-xs text-(--text-muted)">
                      {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 font-semibold">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-(--text-secondary)">
                    {post.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Open projects search: results render here, not in the feed */}
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
              <Button
                label="Buscar"
                buttonType="button"
                colorType="secondary"
                onClick={searchOpenProjects}
              />
            </div>

            <ul className="mt-3 flex flex-col gap-2">
              {openProjects.length === 0 ? (
                <li className="text-sm text-(--text-muted)">
                  Nenhum projeto aberto encontrado.
                </li>
              ) : (
                openProjects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/project/open/${encodeURIComponent(project.id)}`)}
                      className="w-full rounded border border-(--border-subtle) bg-(--surface-2) p-3 text-left transition-colors hover:border-gray-400 hover:cursor-pointer"
                    >
                      <p className="truncate text-sm font-medium">{project.title}</p>
                      <p className="mt-1 text-xs text-(--text-muted)">
                        R$ {project.minBudget} – R$ {project.maxBudget} · {project.status}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* People list */}
          <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
            <h2 className="text-lg mb-3">Pessoas</h2>

            <ul className="flex flex-col gap-3">
              {people.length === 0 ? (
                <li className="text-sm text-(--text-muted)">
                  Ninguém encontrado.
                </li>
              ) : (
                people.map((person) => (
                  <li
                    key={person.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{person.name}</p>
                      <p className="text-xs text-(--text-muted) truncate">
                        {person.bio ?? person.role ?? ""}
                      </p>
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
    </div>
  );
}
