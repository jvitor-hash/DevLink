import { executeController, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type NotificationService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  markAllAsReadForUser: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
};

export const createNotificationController = (service: NotificationService) => ({
  list: ({ query, user, set }: any) => executeController(set, () => service.findAllByUser(user.id, query.limit, query.offset), "Failed to fetch notifications", HttpStatus.INTERNAL_SERVER_ERROR),
  readAll: ({ user, set }: any) => executeController(set, () => service.markAllAsReadForUser(user.id), "Failed to mark all as read", HttpStatus.INTERNAL_SERVER_ERROR),
  update: ({ params, body, user, set }: any) => executeController(set, async () => requireValue(await service.updateForUser(params.id, user.id, body), "Notification not found"), "Failed to update notification", HttpStatus.INTERNAL_SERVER_ERROR),
});
