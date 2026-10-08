import { relations } from "drizzle-orm/_relations";
import { message } from "../message_schema";
import { conversation } from "../conversation_schema";
import { user } from "../user_schema";

export const conversationRelations = relations(conversation, ({ one, many }) => ({
    messages: many(message),

    user: one(user, {
      fields: [conversation.userId],
      references: [user.id],
    }),

    recipient: one(user, {
      fields: [conversation.recipientId],
      references: [user.id],
    }),
  }),
);

export const messageRelations = relations(message, ({ one }) => ({
    conversation: one(conversation, {
      fields: [message.conversationId],
      references: [conversation.id],
    }),
  }),
);
