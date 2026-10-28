import { executeController, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type UserService = {
  search: (...args: any[]) => Promise<any>;
  findProminentClients: (...args: any[]) => Promise<any>;
  updateOwnProfile: (...args: any[]) => Promise<any>;
  getPublicKey: (...args: any[]) => Promise<any>;
  updatePublicKey: (...args: any[]) => Promise<any>;
  findPublicKeyById: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
};

export const createUserController = (service: UserService) => ({
  search: ({ query, set }: any) => executeController(set, () => service.search(query.q ?? "", query.role, query.limit, query.offset), "Failed to search users", HttpStatus.INTERNAL_SERVER_ERROR),
  prominentClients: ({ query, set }: any) => executeController(set, () => service.findProminentClients(query.limit), "Failed to fetch prominent clients", HttpStatus.INTERNAL_SERVER_ERROR),
  updateMe: ({ body, user, set }: any) => executeController(set, async () => requireValue(await service.updateOwnProfile(user.id, body), "User not found"), "Failed to update user", HttpStatus.INTERNAL_SERVER_ERROR),
  publicKey: ({ user, set }: any) => executeController(set, () => service.getPublicKey(user.id), "Failed to fetch public key", HttpStatus.INTERNAL_SERVER_ERROR),
  updatePublicKey: ({ body, user, set }: any) => executeController(set, () => service.updatePublicKey(user.id, body.publicKey), "Failed to update public key", HttpStatus.INTERNAL_SERVER_ERROR),
  userPublicKey: ({ params, set }: any) => executeController(set, async () => ({ publicKey: await service.findPublicKeyById(params.id) }), "Failed to fetch public key", HttpStatus.INTERNAL_SERVER_ERROR),
  getById: ({ params, set }: any) => executeController(set, async () => requireValue(await service.findById(params.id), "User not found"), "Failed to fetch user", HttpStatus.INTERNAL_SERVER_ERROR),
});
