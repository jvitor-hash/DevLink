export const COLUMNS: ReadonlyArray<{ status; label: string; hint: string }> = [
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

export const orderTickets = (tickets) =>
  [...tickets].sort(
    (a, b) => a.position - b.position || String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? ""))
  );

export const countByStatus = (tickets): Record<any, number> => {
  const counts = { BACKLOG: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 } as Record<any, number>;
  for (const ticket of tickets) counts[ticket.status] += 1;
  return counts;
};
