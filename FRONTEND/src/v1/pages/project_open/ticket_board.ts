import type { TicketDTO, TicketStatus } from "@/data/types/database";

// Column order mirrors the API's ticket_status enum; there is no extra
// intermediate state, so drag targets are limited to these four.
export const COLUMNS: ReadonlyArray<{ status: TicketStatus; label: string; hint: string }> = [
  { status: "BACKLOG", label: "Backlog", hint: "A fazer" },
  { status: "IN_PROGRESS", label: "Em andamento", hint: "Em desenvolvimento" },
  { status: "REVIEW", label: "Validação", hint: "Em revisão" },
  { status: "DONE", label: "Finalizado", hint: "Concluído" },
];

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const PRIORITIES: ReadonlyArray<{ value: TicketPriority; label: string }> = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export const DEFAULT_PRIORITY: TicketPriority = "MEDIUM";

// Priority has no column in the API, so it renders as a left border accent.
export const PRIORITY_ACCENT_CLASS: Record<TicketPriority, string> = {
  LOW: "border-l-(--border)",
  MEDIUM: "border-l-(--info)",
  HIGH: "border-l-(--warning)",
  URGENT: "border-l-(--error)",
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export type TicketMeta = {
  tags: string[];
  priority: TicketPriority;
};

export type TicketMetaMap = Record<string, TicketMeta>;

export const DEFAULT_TICKET_META: TicketMeta = { tags: [], priority: DEFAULT_PRIORITY };

const TAG_PALETTE: ReadonlyArray<string> = [
  "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40",
  "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
  "bg-rose-500/15 text-rose-300 border-rose-500/40",
];

const MAX_TAG_LENGTH = 24;

// Cards keep their board order through position, with createdAt as tie-breaker
// for the rows the API hands back with equal positions.
export const orderTickets = (tickets: TicketDTO[]): TicketDTO[] =>
  [...tickets].sort(
    (a, b) => a.position - b.position || String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
  );

// Moves one card into `status` at `index`, renumbering the target column so the
// local order stays consistent until the API call settles.
export const applyMove = (
  tickets: TicketDTO[],
  ticketId: string,
  status: TicketStatus,
  index: number,
): TicketDTO[] => {
  const moving = tickets.find((ticket) => ticket.id === ticketId);

  if (!moving) return tickets;

  const remaining = tickets.filter((ticket) => ticket.id !== ticketId);
  const untouched = remaining.filter((ticket) => ticket.status !== status);
  const target = orderTickets(remaining.filter((ticket) => ticket.status === status));
  const insertAt = Math.max(0, Math.min(index, target.length));
  const moved: TicketDTO = { ...moving, status, position: insertAt };

  target.splice(insertAt, 0, moved);

  return [...untouched, ...target.map((ticket, position) => (ticket.id === moved.id ? ticket : { ...ticket, position }))];
};

export const indexForDrop = (column: TicketDTO[], beforeId: string | null): number => {
  if (!beforeId) return column.length;

  const found = column.findIndex((ticket) => ticket.id === beforeId);

  return found < 0 ? column.length : found;
};

export const nextStatus = (status: TicketStatus): TicketStatus | null => {
  const index = COLUMNS.findIndex((column) => column.status === status);

  return index >= 0 && index < COLUMNS.length - 1 ? COLUMNS[index + 1].status : null;
};

export const previousStatus = (status: TicketStatus): TicketStatus | null => {
  const index = COLUMNS.findIndex((column) => column.status === status);

  return index > 0 ? COLUMNS[index - 1].status : null;
};

export const countByStatus = (tickets: TicketDTO[]): Record<TicketStatus, number> => {
  const counts = { BACKLOG: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 } as Record<TicketStatus, number>;

  for (const ticket of tickets) counts[ticket.status] += 1;

  return counts;
};

// Tags arrive from free text, so casing and separators are normalized once.
export const normalizeTag = (raw: string): string | null => {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  const tag = collapsed.replace(/^#+/, "").slice(0, MAX_TAG_LENGTH);

  return tag.length > 0 ? tag : null;
};

export const uniqueTags = (tags: ReadonlyArray<string>): string[] => {
  const seen = new Map<string, string>();

  for (const raw of tags) {
    const tag = normalizeTag(raw);

    if (tag) seen.set(tag.toLowerCase(), tag);
  }

  return [...seen.values()];
};

export const collectTags = (tickets: TicketDTO[], meta: TicketMetaMap): string[] =>
  uniqueTags(
    tickets.flatMap((ticket) => {
      const entry = meta[ticket.id];

      return entry ? entry.tags : [];
    }),
  ).sort((a, b) => a.localeCompare(b));

// Deterministic colour per tag so the same label always looks the same.
export const tagChipClass = (tag: string): string => {
  let hash = 0;

  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash * 31 + tag.toLowerCase().charCodeAt(index)) % 100_000;
  }

  return TAG_PALETTE[hash % TAG_PALETTE.length];
};

export const matchesTicketQuery = (
  ticket: TicketDTO,
  query: string,
  selectedTags: ReadonlyArray<string>,
  meta: TicketMetaMap,
): boolean => {
  const entry = meta[ticket.id] ?? DEFAULT_TICKET_META;

  if (selectedTags.length > 0 && !selectedTags.every((tag) => entry.tags.includes(tag))) {
    return false;
  }

  const term = query.trim().toLowerCase();

  if (term.length === 0) return true;

  return (
    ticket.title.toLowerCase().includes(term) ||
    (ticket.description ?? "").toLowerCase().includes(term) ||
    entry.tags.some((tag) => tag.toLowerCase().includes(term))
  );
};
