import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "react-feather";
import { savedTicketService } from "@/data/services/saved_ticket_service";
import { projectService } from "@/data/services/project_service";
import { userSingleton } from "@/context/user";
import type { ProjectDTO } from "@/data/types/database";

const POLL_INTERVAL_MS = 15_000;

type SavedTicketsMenuProps = {
  onOpenChange?: (open: boolean) => void;
};

const ProjectRow = ({ project, onClick }: { project: ProjectDTO; onClick: () => void }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded px-2 py-2 text-left transition-colors hover:bg-(--surface-2)"
    >
      <p className="truncate text-sm font-medium text-(--text-primary)">{project.title}</p>
      <p className="text-xs text-(--text-muted)">
        {project.category} · {project.status}
      </p>
    </button>
  </li>
);

/**
 * Navbar dropdown listing the user's saved projects with a live
 * saved-count badge.
 */
export default function SavedTicketsMenu({ onOpenChange }: SavedTicketsMenuProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      const user = userSingleton.getCachedUser();

      if (!user) return;

      try {
        const { savedProjectIds } = await savedTicketService.getSavedProjectIdsByUser(user.id);

        if (!savedProjectIds.length) {
          if (!cancelled) setProjects([]);
          return;
        }

        const details = await Promise.all(
          savedProjectIds.map(async (id): Promise<ProjectDTO | null> => {
            try {
              return await projectService.getById(id);
            } catch {
              return null;
            }
          }),
        );

        if (!cancelled) {
          setProjects(details.filter((project): project is ProjectDTO => project !== null));
        }
      } catch {
        // Keep the current list on failure.
      }
    };

    void load();

    const poll = setInterval(() => {
      void load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (): void => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  if (!userSingleton.isSignedIn) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative hover:cursor-pointer"
        onClick={toggleMenu}
        aria-label="Projetos salvos"
        data-testid="saved-tickets-btn"
      >
        <Bookmark size={18} />
        {projects.length > 0 && (
          <span
            className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-(--primary) px-1 text-center text-[10px] leading-4 text-white"
            data-testid="saved-tickets-count"
          >
            {projects.length}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-80 rounded-md border border-(--border-subtle) bg-(--surface-1) shadow-lg z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 border-b border-(--border-subtle)">
          <p className="font-semibold">Projetos salvos</p>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <li className="px-4 py-6 text-center text-(--text-muted)">Nenhum projeto salvo</li>
          ) : (
            projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onClick={() => {
                  setOpen(false);
                  navigate(`/project/open/${encodeURIComponent(project.id)}`);
                }}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
