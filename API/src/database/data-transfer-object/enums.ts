import z from "zod";

export const UserRoleEnum = z.enum(["CLIENT", "PROGRAMMER", "ADMIN"]);
export const ProgrammingLanguageEnum = z.enum(["CSHARP", "NODE_JS", "JAVA", "GO", "PYTHON", "TYPESCRIPT", "JAVASCRIPT", "PHP", "RUST", "KOTLIN", "SWIFT", "OTHER"]);
export const PlatformTypeEnum = z.enum(["WEB", "DESKTOP", "MOBILE"]);
export const ProjectStatusEnum = z.enum(["OPEN", "NEGOTIATING", "IN_DEVELOPMENT", "COMPLETED", "CANCELLED"]);
export const NotificationTypeEnum = z.enum(["NEW_MESSAGE", "NEW_REVIEW", "PROJECT_UPDATE", "PROJECT_COMPLETED", "PROJECT_CANCELLED", "TICKET_SAVED", "SYSTEM"]);
