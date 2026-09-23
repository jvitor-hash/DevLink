import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const userRelations = relations(schemas.user, ({ many, one }) => ({
  sessions: many(schemas.session),
  accounts: many(schemas.account),
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
