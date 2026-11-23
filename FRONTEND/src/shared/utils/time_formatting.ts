const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/* Short relative timestamp in pt-BR ("agora", "há 5 min", "há 2 dias") */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();

  if (diff < MINUTE_MS) return "agora";
  if (diff < HOUR_MS) return `há ${Math.floor(diff / MINUTE_MS)} min`;
  if (diff < DAY_MS) return `há ${Math.floor(diff / HOUR_MS)} h`;
  if (diff < 7 * DAY_MS) return `há ${Math.floor(diff / DAY_MS)} d`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/* Short timestamp in pt-BR (DD-MM-YYYY) */
export const formatTime = (value: string | Date | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};