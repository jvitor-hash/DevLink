import { describe, expect, test } from "bun:test";

import type { TicketDTO } from "@/data/types/database";
import {
  applyMove,
  collectTags,
  countByStatus,
  indexForDrop,
  matchesTicketQuery,
  nextStatus,
  normalizeTag,
  orderTickets,
  previousStatus,
  tagChipClass,
  uniqueTags,
  type TicketMetaMap,
} from "../ticket_board";

const ticket = (id: string, status: TicketDTO["status"], position: number, extra: Partial<TicketDTO> = {}): TicketDTO => ({
  id,
  projectId: "p1",
  creatorId: "u1",
  title: `Ticket ${id}`,
  status,
  position,
  createdAt: `2026-01-0${position + 1}T00:00:00.000Z`,
  ...extra,
});

describe("orderTickets", () => {
  test("sorts by position regardless of the input order", () => {
    const ordered = orderTickets([ticket("b", "BACKLOG", 2), ticket("a", "BACKLOG", 0), ticket("c", "BACKLOG", 1)]);

    expect(ordered.map((row) => row.id)).toEqual(["a", "c", "b"]);
  });

  test("breaks position ties with createdAt", () => {
    const older = ticket("older", "BACKLOG", 1, { createdAt: "2026-01-01T00:00:00.000Z" });
    const newer = ticket("newer", "BACKLOG", 1, { createdAt: "2026-02-01T00:00:00.000Z" });

    expect(orderTickets([newer, older]).map((row) => row.id)).toEqual(["older", "newer"]);
  });
});

describe("applyMove", () => {
  const board = [ticket("a", "BACKLOG", 0), ticket("b", "BACKLOG", 1), ticket("c", "REVIEW", 0)];

  test("moves a card to another column and renumbers the target", () => {
    const next = applyMove(board, "a", "REVIEW", 1);

    const review = orderTickets(next.filter((row) => row.status === "REVIEW"));

    expect(review.map((row) => row.id)).toEqual(["c", "a"]);
    expect(review.map((row) => row.position)).toEqual([0, 1]);
  });

  test("leaves the untouched column alone", () => {
    const next = applyMove(board, "a", "REVIEW", 0);
    const backlog = next.filter((row) => row.status === "BACKLOG");

    expect(backlog.map((row) => row.id)).toEqual(["b"]);
    expect(backlog[0].position).toBe(1);
  });

  test("clamps an out-of-range index to the end of the column", () => {
    const next = applyMove(board, "c", "BACKLOG", 99);
    const backlog = orderTickets(next.filter((row) => row.status === "BACKLOG"));

    expect(backlog.map((row) => row.id)).toEqual(["a", "b", "c"]);
    expect(backlog[2].position).toBe(2);
  });

  test("keeps a card in place when the index equals its current position", () => {
    const next = applyMove(board, "b", "BACKLOG", 1);

    expect(orderTickets(next.filter((row) => row.status === "BACKLOG")).map((row) => row.id)).toEqual(["a", "b"]);
  });

  test("returns the same list when the ticket does not exist", () => {
    expect(applyMove(board, "missing", "DONE", 0)).toEqual(board);
  });
});

describe("indexForDrop", () => {
  const column = [ticket("a", "BACKLOG", 0), ticket("b", "BACKLOG", 1)];

  test("returns the index of the card the pointer hovered before", () => {
    expect(indexForDrop(column, "b")).toBe(1);
  });

  test("appends when there is no target card", () => {
    expect(indexForDrop(column, null)).toBe(2);
  });

  test("appends when the target card is gone", () => {
    expect(indexForDrop(column, "deleted")).toBe(2);
  });
});

describe("column navigation", () => {
  test("next walks towards DONE and stops at the end", () => {
    expect(nextStatus("BACKLOG")).toBe("IN_PROGRESS");
    expect(nextStatus("IN_PROGRESS")).toBe("REVIEW");
    expect(nextStatus("REVIEW")).toBe("DONE");
    expect(nextStatus("DONE")).toBeNull();
  });

  test("previous walks back and stops at the start", () => {
    expect(previousStatus("DONE")).toBe("REVIEW");
    expect(previousStatus("BACKLOG")).toBeNull();
  });
});

describe("countByStatus", () => {
  test("counts every column including the empty ones", () => {
    const counts = countByStatus([ticket("a", "BACKLOG", 0), ticket("b", "BACKLOG", 1), ticket("c", "DONE", 0)]);

    expect(counts).toEqual({ BACKLOG: 2, IN_PROGRESS: 0, REVIEW: 0, DONE: 1 });
  });
});

describe("tags", () => {
  test("normalizes hashes, spacing and length", () => {
    expect(normalizeTag("  #front   end ")).toBe("front end");
    expect(normalizeTag("a".repeat(40))).toBe("a".repeat(24));
    expect(normalizeTag("   ")).toBeNull();
    expect(normalizeTag("#")).toBeNull();
  });

  test("deduplicates case-insensitively keeping the first casing", () => {
    expect(uniqueTags(["Bug", "bug", " UI ", "Bug"])).toEqual(["Bug", "UI"]);
  });

  test("collects sorted tags across the board", () => {
    const meta: TicketMetaMap = {
      a: { tags: ["ui", "front end"], priority: "HIGH" },
      b: { tags: ["api"], priority: "LOW" },
    };

    expect(collectTags([ticket("a", "BACKLOG", 0), ticket("b", "BACKLOG", 1)], meta)).toEqual(["api", "front end", "ui"]);
  });

  test("gives the same tag the same colour", () => {
    expect(tagChipClass("front end")).toBe(tagChipClass("front end"));
    expect(tagChipClass("front end")).not.toBe(tagChipClass("api"));
  });
});

describe("matchesTicketQuery", () => {
  const rows = [ticket("a", "BACKLOG", 0, { title: "Tela de login", description: "Autenticacao" }), ticket("b", "BACKLOG", 1, { title: "Deploy" })];
  const meta: TicketMetaMap = { a: { tags: ["auth"], priority: "HIGH" } };

  test("matches on title, description or tag", () => {
    expect(matchesTicketQuery(rows[0], "login", [], meta)).toBe(true);
    expect(matchesTicketQuery(rows[0], "autent", [], meta)).toBe(true);
    expect(matchesTicketQuery(rows[0], "auth", [], meta)).toBe(true);
    expect(matchesTicketQuery(rows[1], "auth", [], meta)).toBe(false);
  });

  test("requires every selected tag to be present", () => {
    expect(matchesTicketQuery(rows[0], "", ["auth"], meta)).toBe(true);
    expect(matchesTicketQuery(rows[0], "", ["auth", "ui"], meta)).toBe(false);
  });

  test("an empty query and no tags keeps everything", () => {
    expect(matchesTicketQuery(rows[1], "  ", [], meta)).toBe(true);
  });
});
