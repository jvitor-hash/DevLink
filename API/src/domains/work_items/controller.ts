import type { Context } from "elysia";
import type { WorkItemService } from "./ports";
import { executeController } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";
import { ForbiddenError } from "@/shared/errors/domain_errors";

type AuthenticatedUser = { id: string };
type WorkItemContext = Pick<Context, "set"> & { user: AuthenticatedUser };
type CreateContext<Create> = WorkItemContext & { body: Create };
type ListContext = WorkItemContext & { query: { limit: number; offset: number } };
type ProjectListContext = WorkItemContext & { params: { projectId: string } };
type CountContext = Pick<Context, "set"> & { query: { projectIds: string } };
type UpdateContext<Update> = WorkItemContext & { params: { id: string }; body: Update };
type RemoveContext = WorkItemContext & { params: { id: string } };

export const createWorkItemController = <Create, Update, Item, Counts>(
  service: WorkItemService<Create, Update, Item, Counts>,
  itemName: string,
) => ({
  create: ({ body, user, set }: CreateContext<Create>) => executeController(set, async () => {
    let item: Item;
    try {
      item = await service.createForProject({ ...body, creatorId: user.id });
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found or unauthorized") {
        throw new ForbiddenError("Not a project participant");
      }
      throw error;
    }
    set.status = HttpStatus.CREATED;
    return item;
  }, `Failed to create ${itemName}`, HttpStatus.INTERNAL_SERVER_ERROR),
  list: ({ query, user, set }: ListContext) => executeController(set, () => service.findAllByUser(user.id, query.limit, query.offset), `Failed to fetch ${itemName}s`, HttpStatus.INTERNAL_SERVER_ERROR),
  listByProject: ({ params, user, set }: ProjectListContext) => executeController(set, () => service.findAllByProject(params.projectId, user.id), `Failed to fetch ${itemName}s`, HttpStatus.INTERNAL_SERVER_ERROR),
  counts: async ({ query, set }: CountContext) => executeController(set, async () => ({ counts: await service.countByProjects(query.projectIds) }), `Failed to fetch ${itemName} counts`, HttpStatus.INTERNAL_SERVER_ERROR),
  update: ({ params, body, user, set }: UpdateContext<Update>) => executeController(set, () => service.updateForUser(params.id, user.id, body), `${itemName} not found or unauthorized`, HttpStatus.NOT_FOUND),
  remove: ({ params, user, set }: RemoveContext) => executeController(set, () => service.removeForUser(params.id, user.id), `${itemName} not found or unauthorized`, HttpStatus.NOT_FOUND),
});
