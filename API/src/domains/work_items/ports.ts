export interface WorkItemService<Create, Update, Item, Counts> {
  createForProject(data: Create & { creatorId: string }): Promise<Item>;
  findAllByUser(userId: string, limit: number, offset: number): Promise<Item[]>;
  findAllByProject(projectId: string, userId: string): Promise<Item[]>;
  countByProjects(projectIds: string): Promise<Counts>;
  updateForUser(id: string, userId: string, data: Update): Promise<Item>;
  removeForUser(id: string, userId: string): Promise<Item>;
}
