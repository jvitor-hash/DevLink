import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { session } from "./session_schema";
import { account } from "./account_schema";
import { schemas } from ".";

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  message: many(schemas.message),
  notifications: many(schemas.notification),
  savedTickets: many(schemas.savedTicket),
  preferences: one(schemas.userPreference),

  projectsAsClient: many(schemas.project, {
    relationName: "client_projects",
  }),

  projectsAsProgrammer: many(schemas.project, {
    relationName: "programmer_projects",
  }),

  reviewsWritten: many(schemas.review, {
    relationName: "reviews_written",
  }),

  reviewsReceived: many(schemas.review, {
    relationName: "reviews_received",
  }),
}));
