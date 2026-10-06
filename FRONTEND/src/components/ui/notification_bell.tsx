import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "react-feather";
import { useProjectEvents } from "@/hooks/use_project_events";
import { userSingleton } from "@/context/user";
import type { ProjectEvent } from "@/data/types/database";

// Live bell badge: counts project events that arrived while the user has
// the app open. Client-side only; a fresh session starts at zero.
export default function NotificationBell() {
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());

  const handleEvent = useCallback((event: ProjectEvent): void => {
    setUnreadIds((current) => new Set(current).add(event.id));
  }, []);

  useProjectEvents(userSingleton.id ?? null, { onEvent: handleEvent });

  const count = unreadIds.size;

  return (
    <Link to="/notification" aria-label="Notificações" data-testid="notification-bell" className="relative block">
      <Bell size={18} color="var(--primary)"/>

      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-2 min-w-4 px-1 text-center text-[10px] leading-4"
          data-testid="notification-count"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
