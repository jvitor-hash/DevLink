import { describe, expect, test } from "bun:test";
import {
  canPostMessage,
  canPostOffer,
  canViewChat,
  isNegotiationOpen,
  resolveChatCapability,
} from "../modules/chat_access";

const CLIENT = "client-1";
const ASSIGNED = "programmer-1";
const OTHER_PROGRAMMER = "programmer-2";

const baseProject = {
  clientId: CLIENT,
  programmerId: null as string | null,
  status: "OPEN" as const,
};

describe("Negotiation Window", () => {
  test("OPEN and NEGOTIATING keep the room open to programmers", () => {
    expect(isNegotiationOpen("OPEN")).toBe(true);
    expect(isNegotiationOpen("NEGOTIATING")).toBe(true);
  });

  test("IN_DEVELOPMENT, COMPLETED and CANCELLED close the room", () => {
    expect(isNegotiationOpen("IN_DEVELOPMENT")).toBe(false);
    expect(isNegotiationOpen("COMPLETED")).toBe(false);
    expect(isNegotiationOpen("CANCELLED")).toBe(false);
  });
});

describe("Chat Capability", () => {
  test("project creator is view-only", () => {
    expect(resolveChatCapability(baseProject, CLIENT, "CLIENT")).toBe("VIEW");
    expect(canViewChat(baseProject, CLIENT, "CLIENT")).toBe(true);
    expect(canPostMessage(baseProject, CLIENT, "CLIENT")).toBe(false);
    expect(canPostOffer(baseProject, CLIENT, "CLIENT")).toBe(false);
  });

  test("creator stays view-only after assignment", () => {
    const project = { ...baseProject, programmerId: ASSIGNED, status: "IN_DEVELOPMENT" as const };

    expect(resolveChatCapability(project, CLIENT, "CLIENT")).toBe("VIEW");
    expect(resolveChatCapability(project, ASSIGNED, "PROGRAMMER")).toBe("OFFER");
  });

  test("other programmers can offer while the project is open or negotiating", () => {
    expect(resolveChatCapability(baseProject, OTHER_PROGRAMMER, "PROGRAMMER")).toBe("OFFER");
    expect(resolveChatCapability({ ...baseProject, status: "NEGOTIATING" }, OTHER_PROGRAMMER, "PROGRAMMER")).toBe("OFFER");
  });

  test("other programmers lose offer rights once an offer is accepted", () => {
    const project = { ...baseProject, programmerId: ASSIGNED, status: "IN_DEVELOPMENT" as const };

    expect(resolveChatCapability(project, OTHER_PROGRAMMER, "PROGRAMMER")).toBe("NONE");
    expect(canPostOffer(project, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(false);
    expect(canPostMessage(project, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(false);
  });

  test("other clients can only view the conversation", () => {
    expect(resolveChatCapability(baseProject, "client-2", "CLIENT")).toBe("VIEW");
    expect(canViewChat(baseProject, "client-2", "CLIENT")).toBe(true);
    expect(canPostMessage(baseProject, "client-2", "CLIENT")).toBe(false);
    expect(canPostOffer(baseProject, "client-2", "CLIENT")).toBe(false);
  });

  test("concluded projects are inaccessible to everyone", () => {
    for (const status of ["COMPLETED", "CANCELLED"] as const) {
      const project = { ...baseProject, status };

      expect(resolveChatCapability(project, CLIENT, "CLIENT")).toBe("NONE");
      expect(resolveChatCapability(project, ASSIGNED, "PROGRAMMER")).toBe("NONE");
      expect(canViewChat(project, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(false);
    }
  });

  test("assigned programmer keeps posting inside IN_DEVELOPMENT", () => {
    const project = { ...baseProject, programmerId: ASSIGNED, status: "IN_DEVELOPMENT" as const };

    expect(canPostMessage(project, ASSIGNED, "PROGRAMMER")).toBe(true);
    expect(canPostOffer(project, ASSIGNED, "PROGRAMMER")).toBe(true);
  });

  test("programmers can send plain messages while they can offer", () => {
    expect(canPostMessage(baseProject, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(true);
    expect(canPostMessage({ ...baseProject, status: "NEGOTIATING" }, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(true);
  });

  test("other programmers cannot offer after a rejected offer while NEGOTIATING", () => {
    // Rejection stamps negotiationStartedAt but the project stays open to new
    // programmers until the timeout returns it to OPEN semantics.
    expect(canPostOffer({ ...baseProject, status: "NEGOTIATING" }, OTHER_PROGRAMMER, "PROGRAMMER")).toBe(true);
  });
});
