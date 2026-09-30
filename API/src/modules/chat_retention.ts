import { schemas } from "@/database/schema";
import { db } from "@/client";
import { lt, sql } from "drizzle-orm";

// Retention window for chat history; sessions keys older than this are
// useless because their messages are erased with them.
export const chatRetentionMs = (): number =>
  (Number.parseInt(process.env.CHAT_RETENTION_DAYS ?? "30", 10) || 30) * 24 * 60 * 60 * 1000;

// Erases messages older than the retention window along with the public
// keys whose sessions cannot decrypt anything anymore.
export const sweepExpiredChatData = async (now: Date = new Date()): Promise<{ messagesDeleted: number; keysDeleted: number }> => {
  const cutoff = new Date(now.getTime() - chatRetentionMs());

  const deletedMessages = await db
    .delete(schemas.message)
    .where(lt(schemas.message.createdAt, cutoff))
    .returning({ id: schemas.message.id });

  // Keys never referenced by any remaining message are safe to remove.
  const deletedKeys = await db
    .delete(schemas.chatSessionKey)
    .where(sql`${schemas.chatSessionKey.createdAt} < ${cutoff}`)
    .returning({ id: schemas.chatSessionKey.id });

  return { messagesDeleted: deletedMessages.length, keysDeleted: deletedKeys.length };
};
