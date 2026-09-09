import { account } from "./account_schema";
import { message } from "./message_schema";
import { notification } from "./notification_schema";
import { project } from "./project_schema";
import { review } from "./review_schemas";
import { savedTicket } from "./saved_ticket_schema";
import { session } from "./session_schema";
import { userPreference } from "./user_preferences_schema";
import { user } from "./user_schema";
import { verification } from "./verification_schema";

import { accountRelations } from "./account_relations";
import { sessionRelations } from "./session_relations_schema";
import { userRelations } from "./user_relations_schema";
import { projectsRelations } from "./project_relations";
import { reviewsRelations } from "./review_relations";
import { notificationsRelations } from "./notification_relations";
import { messagesRelations } from "./message_relations";
import { savedTicketsRelations } from "./saved_tickets_relations";
import { userPreferencesRelations } from "./user_preferences_relations";

export * from "./enums_schema";
export * from "./user_schema";
export * from "./account_schema";
export * from "./session_schema";
export * from "./verification_schema";
export * from "./project_schema";
export * from "./review_schemas";
export * from "./notification_schema";
export * from "./message_schema";
export * from "./saved_ticket_schema";
export * from "./user_preferences_schema";

export * from "./account_relations";
export * from "./session_relations_schema";
export * from "./user_relations_schema";
export * from "./project_relations";
export * from "./review_relations";
export * from "./notification_relations";
export * from "./message_relations";
export * from "./saved_tickets_relations";
export * from "./user_preferences_relations";

export const schemas = {
  user,
  account,
  session,
  verification,
  project,
  review,
  notification,
  userPreference,
  message,
  savedTicket,
  accountRelations,
  sessionRelations,
  userRelations,
  projectsRelations,
  reviewsRelations,
  notificationsRelations,
  messagesRelations,
  savedTicketsRelations,
  userPreferencesRelations,
};
