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

export const notificationTypeEnum = pgEnum("notification_type", [
  "NEW_MESSAGE",
  "NEW_REVIEW",
  "PROJECT_UPDATE",
  "PROJECT_COMPLETED",
  "PROJECT_CANCELLED",
  "TICKET_SAVED",
  "SYSTEM",
]);
