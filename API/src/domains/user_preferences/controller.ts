import { executeController, requireSameUser, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type UserPreferenceService = {
  create: (...args: any[]) => Promise<any>;
  findAllByUser: (...args: any[]) => Promise<any>;
  findByUser: (...args: any[]) => Promise<any>;
  findByIdForUser: (...args: any[]) => Promise<any>;
  upsertByUser: (...args: any[]) => Promise<any>;
  removeByUser: (...args: any[]) => Promise<any>;
};

export class UserPreferenceClass {
  constructor(private readonly service: UserPreferenceService) {};

  public create({ body, user, set }: any) {
    return executeController(
      set,
      () => this.service.create({...body, userId: user.id}),
      "Failed to create user preference",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public list({ query, user, set }: any) {
    return executeController(
      set,
      () => this.service.findAllByUser(user.id, query.limit, query.offset),
      "Failed to fetch user preferences",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public byUser({ params, user, set }: any) {
    return executeController(
      set,
      async () => {
        requireSameUser(params.userId, user.id);
        return this.service.findByUser(params.userId)
      },
      "Failed to fetch user preference",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public get({ params, user, set }: any) {
    return executeController(
      set,
      () => this.service.findByIdForUser(params.userId, user.id),
      "User preference not found",
      HttpStatus.NOT_FOUND
    )
  }

  public update({ params, body, user, set }: any) {
    return executeController(
      set,
      async () => {
        requireSameUser(params.id, user.id);
        return this.service.upsertByUser(params.userId, body);
      },
      "Failed to update user preference",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
  
  public remove({ params, user, set }: any) {
    return executeController(
      set,
      () => this.service.removeByUser(params.id, user.id),
      "User preference not found or unauthorized",
      HttpStatus.NOT_FOUND
    )
  }
}