export class MessageService {
  constructor(private readonly workflow: {
    create: (...args: any[]) => Promise<any>;
    list: (...args: any[]) => Promise<any>;
    get: (...args: any[]) => Promise<any>;
    update: (...args: any[]) => Promise<any>;
    remove: (...args: any[]) => Promise<any>;
  }) {}
  create(...args: Parameters<typeof this.workflow.create>) { return this.workflow.create(...args); }
  list(...args: Parameters<typeof this.workflow.list>) { return this.workflow.list(...args); }
  get(...args: Parameters<typeof this.workflow.get>) { return this.workflow.get(...args); }
  update(...args: Parameters<typeof this.workflow.update>) { return this.workflow.update(...args); }
  remove(...args: Parameters<typeof this.workflow.remove>) { return this.workflow.remove(...args); }
}
