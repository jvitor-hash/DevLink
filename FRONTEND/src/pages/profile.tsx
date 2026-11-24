import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { useUserProfile } from "@/features/user/hooks/use_user_profile";
import { useProjects } from "@/features/project/hooks/use_projects";
import { useReviews } from "@/features/reviews/hooks/use_reviews";
import { ProfileCard } from "@/features/user/components/profile_card";
import ProjectPreview from "@/features/project/components/project_preview";
import { ReviewList } from "@/features/reviews/components/review_list";
import { ULIB } from "@/shared/ui";
import { useRedirect } from "@/shared/hooks/use_redirect";

type ProfileTab = "projects" | "reviews" | "activity";

export default function ProfilePage() {
  const { profileId } = useParams<{ profileId?: string }>();
  const currentUser = useCurrentUser();
  const redirect = useRedirect();

  const targetUserId = profileId || currentUser?.id;
  const isOwnProfile = Boolean(currentUser?.id && currentUser.id === targetUserId);

  const { profile, loading: userLoading, error: userError } = useUserProfile(targetUserId);
  const { projects, loading: projectsLoading } = useProjects(
    targetUserId ? { clientId: targetUserId } : {}
  );
  const { reviews, averageRating, loading: reviewsLoading } = useReviews(targetUserId);

  const [activeTab, setActiveTab] = useState<ProfileTab>("projects");

  if (userLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center text-sm text-(--text-muted)">
        Carregando perfil...
      </div>
    );
  }

  if (userError || !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center text-sm text-(--error)">
        {userError ?? "Usuário não encontrado."}
      </div>
    );
  }

  const openProjects = projects.filter((p) => p.status === "OPEN");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-6">
      {/* Profile Header Card */}
      <ProfileCard
        user={profile}
        actions={
          isOwnProfile ? (
            <ULIB.button onClick={() => redirect("/settings")}>Editar perfil</ULIB.button>
          ) : (
            <ULIB.button tone="secondary" onClick={() => redirect("/project")}>Ver projetos</ULIB.button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-(--border-subtle) pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors cursor-pointer ${
            activeTab === "projects"
              ? "bg-(--surface-2) text-(--text-primary) border border-(--border)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          Projetos ({projects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`px-3 py-1.5 text-sm transition-colors cursor-pointer ${
            activeTab === "reviews"
              ? "bg-(--surface-2) text-(--text-primary) border border-(--border)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          Avaliações ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`px-3 py-1.5 text-sm transition-colors cursor-pointer ${
            activeTab === "activity"
              ? "bg-(--surface-2) text-(--text-primary) border border-(--border)"
              : "text-(--text-muted) hover:text-(--text-primary)"
          }`}
        >
          Atividades
        </button>
      </div>

      {/* Main Grid: Tab Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Tab Content */}
        <section className="flex flex-col gap-4">
          {activeTab === "projects" && (
            <div>
              {projectsLoading ? (
                <div className="p-8 text-center text-sm text-(--text-muted)">
                  Carregando projetos...
                </div>
              ) : projects.length === 0 ? (
                <div className="p-8 text-center text-sm text-(--text-muted) italic border border-dashed border-(--border-subtle)">
                  Nenhum projeto publicado por este usuário.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectPreview key={project.id} {...project} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewList reviews={reviews} averageRating={averageRating} loading={reviewsLoading}/>
          )}

          {activeTab === "activity" && (
            <div className="p-4 border border-(--border-subtle) bg-(--surface-1) flex flex-col gap-3">
              <h3 className="text-sm text-(--text-primary)">Atividades recentes</h3>
              {projects.length === 0 ? (
                <p className="text-xs text-(--text-muted) italic">Nenhuma atividade registrada até o momento.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {projects.slice(0, 5).map((project) => (
                    <li
                      key={project.id}
                      className="p-3 border border-(--border-subtle) bg-(--surface-2)/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-(--text-primary)">{project.title}</p>
                        <span className="text-xs text-(--text-muted)">Status: {project.status}</span>
                      </div>
                      <ULIB.button tone="secondary" className="text-xs" onClick={() => redirect(`/project/open/${project.id}`)}>
                        Abrir
                      </ULIB.button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Sidebar: Open Projects */}
        <aside className="flex flex-col gap-4">
          <div className="p-4 rounded-md border border-(--border-subtle) bg-(--surface-1)">
            <h3 className="font-semibold text-sm mb-3 text-(--text-primary)">Projetos Abertos</h3>
            {openProjects.length === 0 ? (
              <p className="text-xs text-(--text-muted) italic">Nenhum projeto em aberto no momento.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {openProjects.map((p) => (
                  <div key={p.id} onClick={() => redirect(`/project/open/${p.id}`)}
                    className="p-3 border border-(--border-subtle) bg-(--surface-2)/50 hover:border-(--primary)/50 cursor-pointer transition-colors"
                  >
                    <p className="text-xs text-(--text-primary) line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-xs text-(--text-muted) mt-1">
                      R$ {p.minBudget.toLocaleString("pt-BR")} – R$ {p.maxBudget.toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
