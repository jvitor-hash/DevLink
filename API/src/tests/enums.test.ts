import { describe, expect, test } from "bun:test";
import {
  UserRoleEnum,
  ProgrammingLanguageEnum,
  PlatformTypeEnum,
  ProjectStatusEnum,
  AudienceEnum,
  NotificationTypeEnum,
} from "../database/data-transfer-object/enums";

describe("Enums Validation", () => {
  test("ProjectStatusEnum values", () => {
    expect(ProjectStatusEnum.parse("OPEN")).toBe("OPEN");
    expect(ProjectStatusEnum.parse("NEGOTIATING")).toBe("NEGOTIATING");
    expect(ProjectStatusEnum.parse("IN_DEVELOPMENT")).toBe("IN_DEVELOPMENT");
    expect(ProjectStatusEnum.parse("COMPLETED")).toBe("COMPLETED");
    expect(ProjectStatusEnum.parse("CANCELLED")).toBe("CANCELLED");
    expect(() => ProjectStatusEnum.parse("INVALID")).toThrow();
  });

  test("PlatformTypeEnum values", () => {
    expect(PlatformTypeEnum.parse("WEB")).toBe("WEB");
    expect(PlatformTypeEnum.parse("DESKTOP")).toBe("DESKTOP");
    expect(PlatformTypeEnum.parse("MOBILE")).toBe("MOBILE");
    expect(() => PlatformTypeEnum.parse("CONSOLE")).toThrow();
  });

  test("ProgrammingLanguageEnum values", () => {
    expect(ProgrammingLanguageEnum.parse("CSHARP")).toBe("CSHARP");
    expect(ProgrammingLanguageEnum.parse("TYPESCRIPT")).toBe("TYPESCRIPT");
    expect(ProgrammingLanguageEnum.parse("RUST")).toBe("RUST");
    expect(() => ProgrammingLanguageEnum.parse("FORTRAN")).toThrow();
  });

  test("AudienceEnum values", () => {
    expect(AudienceEnum.parse("CLIENTS")).toBe("CLIENTS");
    expect(AudienceEnum.parse("INTERNAL_TOOL")).toBe("INTERNAL_TOOL");
    expect(() => AudienceEnum.parse("UNKNOWN")).toThrow();
  });

  test("NotificationTypeEnum values", () => {
    expect(NotificationTypeEnum.parse("NEW_MESSAGE")).toBe("NEW_MESSAGE");
    expect(NotificationTypeEnum.parse("NEW_REVIEW")).toBe("NEW_REVIEW");
    expect(NotificationTypeEnum.parse("PROJECT_UPDATE")).toBe("PROJECT_UPDATE");
    expect(NotificationTypeEnum.parse("PROJECT_COMPLETED")).toBe("PROJECT_COMPLETED");
    expect(NotificationTypeEnum.parse("PROJECT_CANCELLED")).toBe("PROJECT_CANCELLED");
    expect(NotificationTypeEnum.parse("TICKET_SAVED")).toBe("TICKET_SAVED");
    expect(NotificationTypeEnum.parse("SYSTEM")).toBe("SYSTEM");
    expect(() => NotificationTypeEnum.parse("ERROR")).toThrow();
  });

  test("UserRoleEnum values", () => {
    expect(UserRoleEnum.parse("CLIENT")).toBe("CLIENT");
    expect(UserRoleEnum.parse("PROGRAMMER")).toBe("PROGRAMMER");
    expect(UserRoleEnum.parse("ADMIN")).toBe("ADMIN");
    expect(() => UserRoleEnum.parse("GUEST")).toThrow();
  });
});
