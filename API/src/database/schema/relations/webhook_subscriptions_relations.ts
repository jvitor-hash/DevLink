import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const webhookSubscriptionRelations = relations(schemas.webhookSubscription, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.webhookSubscription.userId],
    references: [schemas.user.id],
  }),
}));
