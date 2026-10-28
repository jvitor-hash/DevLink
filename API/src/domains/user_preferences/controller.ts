import { executeController, requireSameUser } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type UserPreferenceService = {
  create: (...args: any[]) => Promise<any>;
  findAllByUser: (...args: any[]) => Promise<any>;
  findByUser: (...args: any[]) => Promise<any>;
  findByIdForUser: (...args: any[]) => Promise<any>;
  upsertByUser: (...args: any[]) => Promise<any>;
  removeByUser: (...args: any[]) => Promise<any>;
};

export const createUserPreferenceController = (service: UserPreferenceService) => ({
  create: ({ body, user, set }: any) => executeController(set, () => service.create({ ...body, userId: user.id }), "Failed to create user preference", HttpStatus.INTERNAL_SERVER_ERROR),
  list: ({ query, user, set }: any) => executeController(set, () => service.findAllByUser(user.id, query.limit, query.offset), "Failed to fetch user preferences", HttpStatus.INTERNAL_SERVER_ERROR),
  byUser: ({ params, user, set }: any) => executeController(set, async () => { requireSameUser(params.userId, user.id); return service.findByUser(params.userId); }, "Failed to fetch user preference", HttpStatus.INTERNAL_SERVER_ERROR),
  get: ({ params, user, set }: any) => executeController(set, () => service.findByIdForUser(params.id, user.id), "User preference not found", HttpStatus.NOT_FOUND),
  update: ({ params, body, user, set }: any) => executeController(set, async () => { requireSameUser(params.userId, user.id); return service.upsertByUser(params.userId, body); }, "Failed to update user preference", HttpStatus.INTERNAL_SERVER_ERROR),
  remove: ({ params, user, set }: any) => executeController(set, () => service.removeByUser(params.id, user.id), "User preference not found or unauthorized", HttpStatus.NOT_FOUND),
});
