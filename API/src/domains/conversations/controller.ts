import { executeController, requireRole, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type ConversationService = {
  listForUser: (...args: any[]) => Promise<any>;
  projectClient: (...args: any[]) => Promise<any>;
  createForProgrammer: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
};

export const createConversationController = (service: ConversationService) => ({
  list: ({ query, user, set }: any) => executeController(set, () => service.listForUser(user.id, user.role, query.projectId), "Failed to fetch conversations", HttpStatus.INTERNAL_SERVER_ERROR),
  create: ({ body, user, set }: any) => executeController(set, async () => {
    requireRole(user.role, "PROGRAMMER", "Only programmers can create conversations");
    const project = await service.projectClient(body.projectId);
    return service.createForProgrammer({ ...body, recipientId: project?.clientId, lastMessage: body.content, unreadMessages: 1, userId: user.id });
  }, "Failed to create conversation", HttpStatus.INTERNAL_SERVER_ERROR),
  get: ({ params, set }: any) => executeController(set, async () => requireValue(await service.findById(params.id), "Conversation not found"), "Failed to fetch conversation", HttpStatus.INTERNAL_SERVER_ERROR),
});
