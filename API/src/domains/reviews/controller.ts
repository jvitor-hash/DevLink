import { executeController, requireValue } from "@/shared/http/controller_handler";
import { HttpStatus } from "@/shared/errors/domain_errors";

type ReviewService = {
  create: (...args: any[]) => Promise<any>;
  findAll: (...args: any[]) => Promise<any>;
  findReceivedByUser: (...args: any[]) => Promise<any>;
  findById: (...args: any[]) => Promise<any>;
  updateByReviewer: (...args: any[]) => Promise<any>;
  removeByReviewer: (...args: any[]) => Promise<any>;
};

export const createReviewController = (service: ReviewService) => ({
  create: ({ body, user, set }: any) => executeController(set, () => service.create({ ...body, reviewerId: user.id }), "Failed to create review", HttpStatus.INTERNAL_SERVER_ERROR),
  list: ({ query, set }: any) => executeController(set, () => service.findAll(query.limit, query.offset), "Failed to fetch reviews", HttpStatus.INTERNAL_SERVER_ERROR),
  byUser: ({ params, query, set }: any) => executeController(set, () => service.findReceivedByUser(params.userId, query.limit, query.offset), "Failed to fetch reviews", HttpStatus.INTERNAL_SERVER_ERROR),
  get: ({ params, set }: any) => executeController(set, async () => requireValue(await service.findById(params.id), "Review not found"), "Failed to fetch review", HttpStatus.INTERNAL_SERVER_ERROR),
  update: ({ params, body, user, set }: any) => executeController(set, () => service.updateByReviewer(params.id, user.id, body), "Review not found or unauthorized", HttpStatus.NOT_FOUND),
  remove: ({ params, user, set }: any) => executeController(set, () => service.removeByReviewer(params.id, user.id), "Review not found or unauthorized", HttpStatus.NOT_FOUND),
});
