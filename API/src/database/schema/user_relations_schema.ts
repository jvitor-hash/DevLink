import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { session } from "./session_schema";
import { account } from "./account_schema";
import { project } from "./project_schema";
import { message } from "./message_schema";
import { notification } from "./notification_schema";
import { savedTicket } from "./saved_ticket_schema";
import { userPreference } from "./user_preferences_schema";
import { review } from "./review_schemas";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  message: many(message),
  notifications: many(notification),
  savedTickets: many(savedTicket),
  preferences: one(userPreference),

  projectsAsClient: many(project, {
    relationName: "client_projects",
  }),

  projectsAsProgrammer: many(project, {
    relationName: "programmer_projects",
  }),

  reviewsWritten: many(review, {
    relationName: "reviews_written",
  }),

  reviewsReceived: many(review, {
    relationName: "reviews_received",
  }),
}));
