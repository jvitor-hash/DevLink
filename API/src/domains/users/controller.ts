import { executeController, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type UserService = {
  search: (...args: any[]) => Promise<any>;
  updateOwnProfile: (...args: any[]) => Promise<any>;
  getPublicKey: (...args: any[]) => Promise<any>;
  updatePublicKey: (...args: any[]) => Promise<any>;
  findPublicKeyById: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
};

export class UserControllerClass {
  constructor(private readonly service: UserService) {};

  public search({ query, set }: any) {
    return executeController(
      set,
      () => this.service.search(query.q ?? "", query.role, query.limit, query.offset),
      "Failed to fetch search users",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public updateMe({ body, user, set }: any) {
    return executeController(
      set,
      async () => requireValue(this.service.updateOwnProfile(user.id, body), "User not found"),
      "Failed to update user",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public publicKey({ user, set }: any) {
    return executeController(
      set,
      () => this.service.getPublicKey(user.id),
      "Failed to fetch public key",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public updatePublicKey({ body, user, set }: any) {
    return executeController(
      set,
      () => this.service.updatePublicKey(user.id, body.publicKey),
      "Failed to update public key",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public userPublicKey({ params, set }: any) {
    return executeController(
      set,
      async () => await this.service.findPublicKeyById(params.id),
      "Failed to fetch public key",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }

  public getById({ params, set }: any) {
    return executeController(
      set,
      async () => requireValue(await this.service.findById(params.id), "User not found"),
      "Failed to fetch user",
      HttpStatus.INTERNAL_SERVER_ERROR
    )
  }
}