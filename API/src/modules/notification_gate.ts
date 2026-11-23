import { eq } from "drizzle-orm";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import type { NotificationType } from "@/database/data-transfer-object/enums";

export const notificationEnabled = async (userId: string, type: NotificationType): Promise<boolean> => {
  const [preferences] = await db
    .select({
      messageNotifications: schemas.userPreference.message_notifications,
      projectNotifications: schemas.userPreference.project_notifications,
    })
    .from(schemas.userPreference)
    .where(eq(schemas.userPreference.userId, userId))
    .limit(1);

  if (!preferences) return true;
  if (["NEW_MESSAGE", "OFFER_ACCEPTED", "OFFER_REJECTED"].includes(type)) return preferences.messageNotifications;
  if (type === "TICKET_SAVED" || type === "NEW_PROJECT" || type === "PROJECT_UPDATE" || type === "PROJECT_COMPLETED" || type === "PROJECT_CANCELLED") {
    return preferences.projectNotifications;
  }

  return true;
};
