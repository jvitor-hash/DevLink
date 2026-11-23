export type TicketService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
};

export type TodoService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
};

interface WorkItemStrategy {
  create(ctx: { body: any; user: any }): Promise<any>;
  list(ctx: { query: any; user: any }): Promise<any>;
  listByProject(ctx: { params: any; user: any }): Promise<any>;
  counts(ctx: { query: any }): Promise<any>;
  update(ctx: { params: any; body: any; user: any }): Promise<any>;
  remove(ctx: { params: any; user: any }): Promise<any>;
}

export class TicketStrategy implements WorkItemStrategy {
  constructor(private readonly ticketService: TicketService) {}

  create({ body, user }: any): Promise<any> {
    return this.ticketService.createForProject({ ...body, creatorId: user.id });
  }

  list({ query, user }: any): Promise<any> {
    return this.ticketService.findAllByUser(user.id, query?.limit, query?.offset);
  }

  listByProject({ params, user }: any): Promise<any> {
    return this.ticketService.findAllByProject(params.projectId, user.id);
  }

  counts({ query }: any): Promise<any> {
    return this.ticketService.countByProjects(query?.projectIds);
  }

  remove({ params, user }: any): Promise<any> {
    return this.ticketService.removeForUser(params.id, user.id);
  }

  update({ params, body, user }: any): Promise<any> {
    return this.ticketService.updateForUser(params.id, user.id, body);
  }
}

export class TodoStrategy implements WorkItemStrategy {
  constructor(private readonly todoService: TodoService) {}

  create({ body, user }: any): Promise<any> {
    return this.todoService.createForProject({ ...body, creatorId: user.id });
  }

  list({ query, user }: any): Promise<any> {
    return this.todoService.findAllByUser(user.id, query?.limit, query?.offset);
  }

  listByProject({ params, user }: any): Promise<any> {
    return this.todoService.findAllByProject(params.projectId, user.id);
  }

  counts({ query }: any): Promise<any> {
    return this.todoService.countByProjects(query?.projectIds);
  }

  remove({ params, user }: any): Promise<any> {
    return this.todoService.removeForUser(params.id, user.id);
  }

  update({ params, body, user }: any): Promise<any> {
    return this.todoService.updateForUser(params.id, user.id, body);
  }
}

export class WorkItemSupervisor {
  constructor(private itemStrategy: WorkItemStrategy | null = null) {}

  create(ctx: any) {
    return this.requireStrategy().create(ctx);
  }

  list(ctx: any) {
    return this.requireStrategy().list(ctx);
  }

  listByProject(ctx: any) {
    return this.requireStrategy().listByProject(ctx);
  }

  counts(ctx: any) {
    return this.requireStrategy().counts(ctx);
  }

  remove(ctx: any) {
    return this.requireStrategy().remove(ctx);
  }

  update(ctx: any) {
    return this.requireStrategy().update(ctx);
  }

  setStrategy(newItemStrategy: WorkItemStrategy) {
    this.itemStrategy = newItemStrategy;
  }

  private requireStrategy(): WorkItemStrategy {
    if (!this.itemStrategy) throw new Error("WorkItemStrategy not set");
    return this.itemStrategy;
  }
}
