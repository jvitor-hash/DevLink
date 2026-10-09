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

export const ticketStatusEnum = pgEnum("ticket_status", [
  "BACKLOG",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "PENDING",
  "ACCEPTED",
  "REFUSED",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "MESSAGE",
  "OFFER",
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

export const outboxStatusEnum = pgEnum("outbox_event_status", [
  "PENDING",
  "PROCESSING",
  "DISPATCHED",
  "FAILED",
  "DEAD_LETTER",
]);

export const projectActionEnum = pgEnum("project_action_type", [
  "SAVE_PROJECT",
  "UPDATE_PROJECT",
  "DELETE_PROJECT",
]);

export const languagePreferenceEnum = pgEnum("language_preference", [
  "ALL",
  ...programmingLanguageEnum.enumValues,
]);

export const platformPreferenceEnum = pgEnum("platform_preference", [
  "ALL",
  ...platformTypeEnum.enumValues,
]);
