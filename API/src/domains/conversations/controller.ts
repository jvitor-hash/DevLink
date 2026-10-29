import { ErrorResponse, executeController, requireRole, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type ConversationService = {
  listForUser: (...args: any[]) => Promise<any>;
  projectClient: (...args: any[]) => Promise<any>;
  createForProgrammer: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
};

export class ConversationControllerClass {
  constructor(private readonly service: ConversationService) {};

  public list({ query, user, set }: any) {
    return executeController(
      set,
      () => this.service.listForUser(user.id, user.role, query.projectId),
      "Failed to fetch conversations",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public create({ body, user, set}: any) {
    return executeController(
      set,
      async () => {
        requireRole(user.role, "PROGRAMMER", "Only programmers can start a conversation");

        const project = await this.service.projectClient(body.projectId);

        return this.service.createForProgrammer({
          ...body,
          recipientId: project?.clientId,
          lastMessage: body.content,
          unreadMessages: 1,
          userId: user.id,
        });
      },
      "Failed to create conversation",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  } 

  public get({ params, set }: any) {
    return executeController(
      set,
      async () => requireValue(await this.service.findById(params.id), "Conversation not found"),
      "Failed to fetch conversation",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
