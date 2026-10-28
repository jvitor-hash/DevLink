import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type MessageService = {
  create: (...args: any[]) => Promise<any>;
  list: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  remove: (...args: any[]) => Promise<any>;
};

export const createMessageController = (service: MessageService) => ({
  create: ({ body, user, set }: any) => executeController(set, () => service.create(body, user), "Failed to create message", HttpStatus.INTERNAL_SERVER_ERROR),
  list: ({ query, user, set }: any) => executeController(set, () => service.list(query.conversationId, user, query.limit, query.offset), "Failed to fetch messages", HttpStatus.INTERNAL_SERVER_ERROR),
  get: ({ params, set }: any) => executeController(set, () => service.get(params.id), "Failed to fetch message", HttpStatus.NOT_FOUND),
  update: ({ params, body, user, set }: any) => executeController(set, () => service.update(params.id, body, user), "Message not found", HttpStatus.NOT_FOUND),
  remove: ({ params, set }: any) => executeController(set, () => service.remove(params.id), "Message not found", HttpStatus.NOT_FOUND),
});
