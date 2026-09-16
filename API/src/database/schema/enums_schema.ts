import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "OPEN",
  "NEGOTIATING",
  "IN_DEVELOPMENT",
  "COMPLETED",
  "CANCELLED",
]);

export const platformTypeEnum = pgEnum("platform_type", [
  "WEB",
  "DESKTOP",
  "MOBILE",
]);

export const programmingLanguageEnum = pgEnum("programming_language", [
  "CSHARP",
  "NODE_JS",
  "JAVA",
  "GO",
  "PYTHON",
  "TYPESCRIPT",
  "JAVASCRIPT",
  "PHP",
  "RUST",
  "KOTLIN",
  "SWIFT",
  "OTHER",
]);

export const audienceEnum = pgEnum("audience", [
  "CLIENTS",
  "INTERNAL_TOOL",
  "STUDENTS",
  "BUSINESSES",
  "ADMINISTRATORS",
  "RESEARCHER"
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_MESSAGE",
  "NEW_REVIEW",
  "NEW_PROJECT",
  "PROJECT_UPDATE",
  "PROJECT_COMPLETED",
  "PROJECT_CANCELLED",
  "TICKET_SAVED",
  "SYSTEM",
]);

export const languagePreferenceEnum = pgEnum("language_preference", [
  "ALL",
  ...programmingLanguageEnum.enumValues,
]);

export const platformPreferenceEnum = pgEnum("platform_preference", [
  "ALL",
  ...platformTypeEnum.enumValues,
]);
