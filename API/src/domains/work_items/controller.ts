import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";
import { WorkItemSupervisor } from "./strategy";

type TicketService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
}

type TodoService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
}

export class WorkItemControllerClass {
  private readonly workItemSupervisor = new WorkItemSupervisor();
  constructor(private readonly ticketService: TicketService, private readonly todoService: TodoService) {};

  public create({ body, user, set }: any) {
    return executeController(
      set,
      () => {
        switch (body.type) {
          case "TICKET":
            this.workItemSupervisor.setStrategy()
            break;
          case "TODO":
            break;
        }
      },
      "Failed to create work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

// export const createWorkItemController = <Create, Update, Item, Counts>(
//   service: WorkItemService<Create, Update, Item, Counts>,
//   itemName: string,
// ) => ({
//   create: ({ body, user, set }: CreateContext<Create>) => executeController(set, async () => {
//     let item: Item;
//     try {
//       item = await service.createForProject({ ...body, creatorId: user.id });
//     } catch (error) {
//       if (error instanceof Error && error.message === "Project not found or unauthorized") {
//         throw new ForbiddenError("Not a project participant");
//       }
//       throw error;
//     }
//     set.status = HttpStatus.CREATED;
//     return item;
//   }, `Failed to create ${itemName}`, HttpStatus.INTERNAL_SERVER_ERROR),
//   list: ({ query, user, set }: ListContext) => executeController(set, () => service.findAllByUser(user.id, query.limit, query.offset), `Failed to fetch ${itemName}s`, HttpStatus.INTERNAL_SERVER_ERROR),
//   listByProject: ({ params, user, set }: ProjectListContext) => executeController(set, () => service.findAllByProject(params.projectId, user.id), `Failed to fetch ${itemName}s`, HttpStatus.INTERNAL_SERVER_ERROR),
//   counts: async ({ query, set }: CountContext) => executeController(set, async () => ({ counts: await service.countByProjects(query.projectIds) }), `Failed to fetch ${itemName} counts`, HttpStatus.INTERNAL_SERVER_ERROR),
//   update: ({ params, body, user, set }: UpdateContext<Update>) => executeController(set, () => service.updateForUser(params.id, user.id, body), `${itemName} not found or unauthorized`, HttpStatus.NOT_FOUND),
//   remove: ({ params, user, set }: RemoveContext) => executeController(set, () => service.removeForUser(params.id, user.id), `${itemName} not found or unauthorized`, HttpStatus.NOT_FOUND),
// });
