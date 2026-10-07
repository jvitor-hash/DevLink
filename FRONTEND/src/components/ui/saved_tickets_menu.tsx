import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark } from "react-feather";
import { userSingleton } from "@/context/user";
import { projectService } from "@/data/services/project_service";
import { reportError } from "@/utils/report_error";
import type { ProjectDTO } from "@/data/types/database";

type SavedTicketsMenuProps = {
  onOpenChange?: (open: boolean) => void;
};

const ProjectRow = ({ project, onClick }: { project: ProjectDTO; onClick: () => void }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded px-2 py-2 text-left transition-colors hover:bg-(--surface-2) cursor-pointer"
    >
      <p className="truncate text-sm font-medium text-(--text-primary)">{project.title}</p>
      <p className="text-xs text-(--text-muted)">
        {project.category} · {project.status}
      </p>
    </button>
  </li>
);

/**
 * Navbar dropdown listing the signed-in user's projects.
 */
export default function SavedTicketsMenu({ onOpenChange }: SavedTicketsMenuProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load the user's projects each time the dropdown opens; keep the last
  // list around so the count badge is visible before the first open.
  useEffect(() => {
    if (!userSingleton.isSignedIn) return;

    let cancelled = false;

    projectService
      .list({ clientId: userSingleton.id ?? "", limit: 20 })
      .then((rows) => {
        if (!cancelled) setProjects(rows);
      })
      .catch((error: unknown) => reportError("saved_tickets_menu: carregar projetos", error));

    return () => {
      cancelled = true;
    };
  }, [open, userSingleton.isSignedIn]);

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
        className="relative cursor-pointer"
        onClick={toggleMenu}
        aria-label="Projetos salvos"
        data-testid="saved-tickets-btn"
      >
        <Bookmark size={18} color="var(--primary)"/>
        {projects.length > 0 && (
          <span
            className="bg-(--primary) rounded-full absolute -top-1.5 -right-2 min-w-4 px-1 text-center text-[10px] text-white leading-4"
            data-testid="saved-tickets-count"
          >
            {projects.length}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-80 border border-(--border-subtle) bg-(--surface-1) shadow-lg z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 border-b border-(--border-subtle)">
          <h5 className="text-lg">Meus projetos</h5>
        </div>

        <ul className="max-h-80 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <li className="px-4 py-6 text-center text-(--text-muted)">Nenhum projeto encontrado</li>
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
