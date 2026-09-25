import {useState } from "react";
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router-dom";
import Button from "@/components/ui/button_component";
import { userSingleton } from "@/lib/types/user";
import { userService } from "@/services/user_service";
import type { ProjectDTO, PublicUserDTO } from "@/lib/types/database";
import { formatRelativeTime } from "@/lib/utils/time_formatting";
import Badge from "@/components/ui/badge_component";
import { projectService } from "@/services/project_service";
import { HIDDEN_PROJECT_STATUSES } from "@/lib/types/project_filters";

const FEED_TABS: Array<{ key: string; label: string }> = [
  { key: "ACTIVITY", label: "Atividades" },
  { key: "PROJECTS", label: "Projetos" },
  { key: "REVIEWS", label: "Avaliações" },
];

type ProfileLoaderData = {
  user: PublicUserDTO
  projects: ProjectDTO[]
}

export async function ProfileSelfLoader(): Promise<ProfileLoaderData> {
  const cached = userSingleton.getCachedUser();
  if (!cached) throw new Error("Usuario nao encontrado");

  const projects = await projectService.list({
    excludeStatuses: HIDDEN_PROJECT_STATUSES,
    clientId: cached.id,
    limit: 20,
    offset: 0
  });

  return {
    user: cached,
    projects: projects
  };
}

export async function ProfileOtherLoader({ params }: LoaderFunctionArgs): Promise<ProfileLoaderData> {
  const user = await userService.getById(params.userId);
  if (!user) throw new Error("Usuario nao encontrado");

  const projects = await projectService.list({
    excludeStatuses: HIDDEN_PROJECT_STATUSES,
    clientId: user.id,
    limit: 20,
    offset: 0
  });

  return {
    user: user,
    projects: projects
  };
}

export default function ProfilePage() {
  const { user, projects } = useLoaderData<typeof ProfileLoaderData>();
  const [profileUser] = useState<PublicUserDTO | null>(user ?? null);
  const [openProjects] = useState<ProjectDTO[]>(projects ?? []);
  const [activeTab, setActiveTab] = useState<string | null>(FEED_TABS["keys"][0] ?? null);
  const navigate = useNavigate();

  if (!profileUser) return null;

  const isOwnProfile = userSingleton.getCachedUser()?.id === profileUser.id;

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
            {/* badge type needs a mapping based on the user's role. */}
            <Badge label={profileUser?.role} badgeType={"primary"} />
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

          {openProjects.length === 0 ? (
            <p className="text-(--text-muted) py-6 text-center">
              Nenhuma atividade recente.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {openProjects.map((post) => (
                <li
                  key={post.id}
                  className="rounded border border-(--border-subtle) bg-(--surface-2) p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-(--text-muted)">{post.status}</p>
                    <p className="shrink-0 text-xs text-(--text-muted)">
                      {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 font-semibold">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-(--text-secondary)">
                    {post.description}
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
        </div>
      </div>
    </div>
  );
}
