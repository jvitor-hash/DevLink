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

export class ReviewControllerClass {
  constructor(private readonly service: ReviewService) {};

  public create({ body, user, set }: any) {
    return executeController(
      set,
      () => this.service.create({ ...body, reviewerId: user.id }),
      "Failed to create review",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public list({ query, set }: any) {
    return executeController(
      set,
      () => this.service.findAll(query.limit, query.offset),
      "Failed to fetch reviews",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public byUser({ params, query, set }: any) {
    return executeController(
      set,
      () => this.service.findReceivedByUser(params.userId, query.limit, query.offset),
      "Failed to fetch reviews",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public get({ params, set }: any) {
    return executeController(
      set,
      async () => requireValue(await this.service.findById(params.id), "Review not found"),
      "Failed to fetch review",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public update({ params, body, user, set }: any) {
    return executeController(
      set,
      () => this.service.updateByReviewer(params.id, user.id, body),
      "Review not found ot unauthorized",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  public remove({ params, user, set }: any) {
    return executeController(
      set,
      () => this.service.removeByReviewer(params.id, user.id),
      "Review not found or unauthorized",
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
