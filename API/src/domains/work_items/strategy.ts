export type TicketService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
}

export type TodoService = {
  findAllByUser: (...args: any[]) => Promise<any>;
  findAllByProject: (...args: any[]) => Promise<any>;
  createForProject: (...args: any[]) => Promise<any>;
  updateForUser: (...args: any[]) => Promise<any>;
  removeForUser: (...args: any[]) => Promise<any>;
  countByProjects: (...args: any[]) => Promise<any>;
}

interface WorkItemStrategy {
  create({ payload, user }: any): Promise<any>;
  list({ query, user }: any): Promise<any>;
  listByProject({ params, user }: any): Promise<any>;
  counts({ query }: any): Promise<any>;
  update({ params, body, user }: any): Promise<any>;
  remove({ payload }: any): Promise<any>;
}

export class TicketStrategy implements WorkItemStrategy {
  constructor(private readonly ticketService: TicketService) {}

  create(payload: any): Promise<any> { return this.ticketService.createForProject(payload); }
  list(payload: any): Promise<any> { return this.ticketService.findAllByUser(payload); }
  listByProject(payload: any): Promise<any> { return this.ticketService.findAllByProject(payload); }
  counts(payload: any ): Promise<any> { return this.ticketService.countByProjects(payload); }
  remove(payload: any ): Promise<any> { return this.ticketService.removeForUser(payload); }
  update(payload: any): Promise<any> { return this.ticketService.updateForUser(payload); }
}

export class TodoStrategy implements WorkItemStrategy {
  constructor(private readonly todoService: TodoService) {}

  create(payload: any): Promise<any> { return this.todoService.createForProject(payload); }
  list(payload: any): Promise<any> { return this.todoService.findAllByUser(payload); }
  listByProject(payload: any): Promise<any> { return this.todoService.findAllByProject(payload); }
  counts(payload: any): Promise<any> { return this.todoService.countByProjects(payload) }
  remove(payload: any): Promise<any> { return this.todoService.removeForUser(payload); }
  update(payload: any): Promise<any> { return this.todoService.updateForUser(payload); }
}

export class WorkItemSupervisor {
  constructor(private itemStrategy: WorkItemStrategy | null = null) { }

  create(...args: any[]) { return this.requireStrategy().create(args); }
  list(...args: any[]) { return this.requireStrategy().list(args); }
  listByProject(...args: any[]) { return this.requireStrategy().listByProject(args); }
  counts(...args: any[]) { return this.requireStrategy().counts(args); }
  remove(...args: any[]) { return this.itemStrategy?.remove(args); }
  update(...args: any[]) { return this.itemStrategy?.update(args); }

  setStrategy(newItemStrategy: WorkItemStrategy) {
    this.itemStrategy = newItemStrategy;
  }

  private requireStrategy(): WorkItemStrategy {
    if (!this.itemStrategy) throw new Error("WorkItemStrategy not set");
    return this.itemStrategy;
  }
}
