export class SaveProjectService {
  constructor(private readonly saves: {
    save: (command: { userId: string; projectId: string }) => Promise<unknown>;
    unsave: (command: { userId: string; projectId: string }) => Promise<unknown>;
  }) {}
  save(command: { userId: string; projectId: string }) { return this.saves.save(command); }
  unsave(command: { userId: string; projectId: string }) { return this.saves.unsave(command); }
}
