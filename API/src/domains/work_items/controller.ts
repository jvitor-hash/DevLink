import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";
import { TicketStrategy, TodoStrategy, WorkItemSupervisor, type TicketService, type TodoService } from "./strategy";

export class WorkItemControllerClass {
  private readonly workItemSupervisor = new WorkItemSupervisor();
  private readonly ticketStrategy: TicketStrategy;
  private readonly todoStrategy: TodoStrategy;

  constructor(private readonly ticketService: TicketService, private readonly todoService: TodoService) {
    this.ticketStrategy = new TicketStrategy(ticketService);
    this.todoStrategy = new TodoStrategy(todoService);
  }

  public create = ({ body, user, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        set.status = HttpStatus.CREATED;
        return await this.workItemSupervisor.create({ body, user });
      },
      "Failed to create work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  public list = ({ query, body, user, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.list({ query, user });
      },
      "Failed to fetch work items",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  public listByProject = ({ params, body, user, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.listByProject({ params, user });
      },
      "Failed to fetch work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  public counts = ({ query, body, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return { counts: await this.workItemSupervisor.counts({ query }) };
      },
      "Failed to fetch count of work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  public update = ({ params, body, user, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.update({ params, body, user });
      },
      "Failed to update work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  public remove = ({ params, body, user, set }: any) => {
    return executeController(
      set,
      async () => {
        this.decideStrategy(body);
        return await this.workItemSupervisor.remove({ params, user });
      },
      "Failed to remove work item",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  };

  private decideStrategy(body: any) {
    const type = body?.type || body?.body?.type;
    switch (type) {
      case "TICKET":
        this.workItemSupervisor.setStrategy(this.ticketStrategy);
        break;
      case "TODO":
        this.workItemSupervisor.setStrategy(this.todoStrategy);
        break;
    }
  }
}
