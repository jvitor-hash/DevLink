import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type MessageService = {
  create: (...args: any[]) => Promise<any>;
  list: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  remove: (...args: any[]) => Promise<any>;
};

export class MessageControllerClass {
  constructor(private readonly service: MessageService) {};

  public create({ body, user, set }: any) {
    return executeController(
      set,
      () => this.service.create(body, user),
      "Failed to create message",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public list({ query, user, set }: any) {
    return executeController(
      set,
      () => this.service.list(query.conversationId, user, query.limit, query.offset),
      "Failed to fetch messages",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public get({ params, set }: any) {
    return executeController(
      set,
      () => this.service.get(params.id),
      "Failed to fetch message",
      HttpStatus.NOT_FOUND
    );
  }

  public update({ params, body, user, set }: any) {
    return executeController(
      set,
      () => this.service.update(params.id, body, user),
      "Message not found",
      HttpStatus.NOT_FOUND
    );
  }

  public remove({ params, set }: any) {
    return executeController(
      set,
      () => this.service.remove(params.id),
      "Message not found",
      HttpStatus.NOT_FOUND
    );
  }
}