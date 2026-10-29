import { executeController, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type NotificationService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  markAllAsReadForUser: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
};

export class NotificationControllerClass {
  constructor(private readonly service: NotificationService) {};

  public list({ query, user, set }: any) {
    return executeController(
      set,
      () => this.service.findAllByUser(user.id, query.limit, query.offset),
      "Failed to fetch notifications",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public readAll({ user, set }: any) {
    return executeController(
      set,
      () => this.service.markAllAsReadForUser(user.id),
      "Failed to mark all notifications as read",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public update({ params, body, user, set }: any) {
    return executeController(
      set,
      async () => requireValue(await this.service.updateForUser(params.id, user.id, body), "Notification not found"),
      "Failed to update notification",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}