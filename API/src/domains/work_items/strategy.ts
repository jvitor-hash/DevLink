interface WorkItemStrategy {
  create(): void;
  list(): void;
  listByProject(): void;
  counts(): void;
  update(): void;
  remove(): void;
}

export class TicketStrategy implements WorkItemStrategy {
  constructor() {}

  create() {}
  list() {}
  listByProject(): void {}
  counts(): void {}
  remove(): void {}
  update(): void {}
}

export class TodoStrategy implements WorkItemStrategy {
  constructor() {}

  create() {}
  list() {}
  listByProject(): void { }
  counts(): void { }
  remove(): void { }
  update(): void {}
}

export class WorkItemSupervisor {
  constructor(private itemStrategy: WorkItemStrategy | null = null) { }

  create(payload: any) { return this.requireStrategy().create(payload); }
  list(payload: any) { return this.requireStrategy().list(payload); }
  listByProject(payload: any) { return this.requireStrategy().listByProject(payload) }
  counts() { return this.requireStrategy().counts() }
  remove() { return this.itemStrategy?.remove() }
  update() { return this.itemStrategy?.update() }

  setStrategy(newItemStrategy: WorkItemStrategy) {
    this.itemStrategy = newItemStrategy;
  }

  private requireStrategy(): WorkItemStrategy {
    if (!this.itemStrategy) throw new Error("WorkItemStrategy not set");
    return this.itemStrategy;
  }
}
