import { describe, expect, test } from "bun:test";
import {
  isProjectConcluded,
  isNegotiationExpired,
  offerResponseProjectPatch,
} from "../modules/project_status";

describe("Concluded Project Rules", () => {
  test("COMPLETED and CANCELLED are concluded", () => {
    expect(isProjectConcluded("COMPLETED")).toBe(true);
    expect(isProjectConcluded("CANCELLED")).toBe(true);
  });

  test("OPEN, NEGOTIATING and IN_DEVELOPMENT are not concluded", () => {
    expect(isProjectConcluded("OPEN")).toBe(false);
    expect(isProjectConcluded("NEGOTIATING")).toBe(false);
    expect(isProjectConcluded("IN_DEVELOPMENT")).toBe(false);
  });
});

describe("Offer Response Project Patch", () => {
  test("accepted offer moves project to IN_DEVELOPMENT", () => {
    const patch = offerResponseProjectPatch("NEGOTIATING", "ACCEPTED");

    expect(patch).not.toBeNull();
    expect(patch?.status).toBe("IN_DEVELOPMENT");
    expect(patch?.negotiationStartedAt).toBeNull();
  });

  test("rejected offer moves project to NEGOTIATING and stamps the clock", () => {
    const patch = offerResponseProjectPatch("OPEN", "REJECTED");

    expect(patch).not.toBeNull();
    expect(patch?.status).toBe("NEGOTIATING");
    expect(patch?.negotiationStartedAt).toBeInstanceOf(Date);
  });

  test("concluded projects never change status on offer response", () => {
    expect(offerResponseProjectPatch("COMPLETED", "REJECTED")).toBeNull();
    expect(offerResponseProjectPatch("CANCELLED", "ACCEPTED")).toBeNull();
  });

  test("projects already in development never change status", () => {
    expect(offerResponseProjectPatch("IN_DEVELOPMENT", "REJECTED")).toBeNull();
    expect(offerResponseProjectPatch("IN_DEVELOPMENT", "ACCEPTED")).toBeNull();
  });
});

describe("Negotiation Expiry", () => {
  const HOUR_MS = 3_600_000;

  test("project without negotiation timestamp never expires", () => {
    expect(isNegotiationExpired(null, HOUR_MS)).toBe(false);
  });

  test("project inside the timeout window does not expire", () => {
    const startedAt = new Date(Date.now() - 30 * 60_000);

    expect(isNegotiationExpired(startedAt, HOUR_MS)).toBe(false);
  });

  test("project past the timeout window expires", () => {
    const startedAt = new Date(Date.now() - 2 * HOUR_MS);

    expect(isNegotiationExpired(startedAt, HOUR_MS)).toBe(true);
  });

  test("expiry respects the exact boundary", () => {
    const now = new Date("2026-09-23T12:00:00.000Z");
    const startedAt = new Date(now.getTime() - HOUR_MS);

    expect(isNegotiationExpired(startedAt, HOUR_MS, now)).toBe(true);
    expect(isNegotiationExpired(new Date(now.getTime() - HOUR_MS + 1), HOUR_MS, now)).toBe(false);
  });
});
