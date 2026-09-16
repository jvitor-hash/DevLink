import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "react-feather";
import { notificationService } from "@/services/notification_service";
import { authService } from "@/services/auth_service";
import type { NotificationDTO } from "@/lib/types/database";

type NotificationBellProps = {
  onOpenChange?: (open: boolean) => void;
};

const formatTime = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export default function NotificationBell({ onOpenChange }: NotificationBellProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [recent, setRecent] = useState<NotificationDTO[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const items = await notificationService.list({ limit: 5, offset: 0 });
        setRecent(Array.isArray(items) ? items : []);
      } catch {
        setRecent([]);
      }
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [open]);

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

  const openFullPage = (): void => {
    setOpen(false);
    navigate("/notification");
  };

  if (!authService.getCachedUser()) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" className="relative hover:cursor-pointer" onClick={toggleMenu} data-testid="notification-bell">
        <Bell size={18} />
        {recent.some((item) => !item.isRead) && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-(--error)" />
        )}
      </button>

      <div
        className={`absolute right-0 mt-3 w-80 rounded-md border border-(--border-subtle) bg-(--surface-1) shadow-lg z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-subtle)">
          <p className="font-semibold">Notificacoes</p>
          <button type="button" className="text-sm text-(--info) hover:underline" onClick={openFullPage}>
            Ver todas
          </button>
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <li className="px-4 py-6 text-center text-(--text-muted)">Nenhuma notificacao</li>
          ) : (
            recent.map((item) => (
              <li key={item.id} className="px-4 py-3 border-b border-(--border-subtle) last:border-b-0">
                <p className={`text-sm ${item.isRead ? "text-(--text-muted)" : "text-white font-semibold"}`}>
                  {item.title}
                </p>
                <p className="text-xs text-(--text-muted) line-clamp-2">{item.message}</p>
                <p className="text-xs text-(--text-disabled) mt-1">{formatTime(item.createdAt)}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
