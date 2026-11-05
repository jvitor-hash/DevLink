import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";
import { TicketStrategy, TodoStrategy, WorkItemSupervisor, type TicketService, type TodoService } from "./strategy";


export class WorkItemControllerClass {
  private readonly workItemSupervisor = new WorkItemSupervisor();
  private readonly ticketStrategy;
  private readonly todoStrategy;

  constructor(private readonly ticketService: TicketService, private readonly todoService: TodoService) {
    this.ticketStrategy = new TicketStrategy(ticketService);
    this.todoStrategy = new TodoStrategy(todoService);
  };

  public create({ body, user, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.create({ body, user });
      },
      "Failed to create work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public list({ query, body, user, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.list({ query, user });
      },
      "Failed to fetch work items",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public listByProject({ params, body, user, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.listByProject({ params, user });
      },
      "Failed to fetch work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public counts({ query, body, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.counts({ query });
      },
      "Failed to fetch count of work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public update({ params, body, user, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.update({ params, body, user });
      },
      "Failed to update work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public remove({ query, body, user, set }: any) {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.remove({ query, user });
      },
      "Failed to remove work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private decideStrategy({ body }: any) {
    switch (body.type) {
      case "TICKET":
        this.workItemSupervisor.setStrategy(this.ticketStrategy);
        break;
      case "TODO":
        this.workItemSupervisor.setStrategy(this.todoStrategy);
        break;
    }
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
