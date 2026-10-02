import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { TicketDTO } from "@/data/types/database";
import KanbanBoard from "../kanban_board";
import TicketModal from "../ticket_modal";
import { DEFAULT_TICKET_META, type TicketMetaMap } from "../ticket_board";

const ticket = (id: string, status: TicketDTO["status"], position: number, title: string): TicketDTO => ({
  id,
  projectId: "p1",
  creatorId: "u1",
  title,
  status,
  position,
});

const tickets: TicketDTO[] = [
  ticket("t1", "BACKLOG", 0, "Modelar o banco"),
  ticket("t2", "BACKLOG", 1, "Criar a home"),
  ticket("t3", "IN_PROGRESS", 0, "Endpoint de login"),
];

const metaMap: TicketMetaMap = {
  t1: { tags: ["backend"], priority: "MEDIUM" },
  t3: { tags: ["backend", "auth"], priority: "URGENT" },
};

const noop = (): void => undefined;

const renderBoard = (): string =>
  renderToStaticMarkup(
    <KanbanBoard
      tickets={tickets}
      metaMap={metaMap}
      getMeta={(id) => metaMap[id] ?? DEFAULT_TICKET_META}
      onOpenTicket={noop}
      onCreateTicket={noop}
      onMove={noop}
    />,
  );

describe("KanbanBoard markup", () => {
  test("renders every column with its count", () => {
    const markup = renderBoard();

    expect(markup).toContain('data-testid="board-column-BACKLOG"');
    expect(markup).toContain('data-testid="board-column-IN_PROGRESS"');
    expect(markup).toContain('data-testid="board-column-REVIEW"');
    expect(markup).toContain('data-testid="board-column-DONE"');
    // Two backlog cards and one in progress; the count badge renders per column.
    expect(markup).toContain(">2</span>");
    expect(markup).toContain(">1</span>");
  });

  test("renders each card as a draggable element", () => {
    const markup = renderBoard();

    expect(markup).toContain('data-testid="ticket-card-t1"');
    expect(markup).toContain('data-testid="ticket-card-t3"');
    expect(markup).toContain("draggable=\"true\"");
  });

  test("shows tags and the priority badge", () => {
    const markup = renderBoard();

    expect(markup).toContain("backend");
    expect(markup).toContain("Urgente");
  });

  test("offers a per-column create action and the filter input", () => {
    const markup = renderBoard();

    expect(markup).toContain('data-testid="board-add-ticket-DONE"');
    expect(markup).toContain('data-testid="board-filter-input"');
  });

  test("marks the first column as unmovable backwards and the last as unmovable forwards", () => {
    const markup = renderBoard();

    expect(markup).toContain("Mover &quot;Modelar o banco&quot; para a próxima coluna");
    expect(markup).toContain("disabled=\"\"");
  });
});

describe("TicketModal markup", () => {
  test("fills the form when editing an existing ticket", () => {
    const markup = renderToStaticMarkup(
      <TicketModal
        ticket={{ ...ticket("t1", "REVIEW", 0, "Revisar copy"), description: "Texto de apoio" }}
        initialStatus="BACKLOG"
        initialMeta={{ tags: ["ux"], priority: "HIGH" }}
        onClose={noop}
        onSubmit={noop}
        onDelete={noop}
      />,
    );

    expect(markup).toContain("Editar cartão");
    expect(markup).toContain('value="Revisar copy"');
    expect(markup).toContain("Texto de apoio");
    expect(markup).toContain("ux");
    expect(markup).toContain('data-testid="ticket-delete-btn"');
  });

  test("starts blank with the requested column when creating", () => {
    const markup = renderToStaticMarkup(
      <TicketModal
        ticket={null}
        initialStatus="REVIEW"
        initialMeta={DEFAULT_TICKET_META}
        onClose={noop}
        onSubmit={noop}
        onDelete={noop}
      />,
    );

    expect(markup).toContain("Novo cartão");
    expect(markup).toContain('value="REVIEW"');
    expect(markup).not.toContain('data-testid="ticket-delete-btn"');
  });
});
