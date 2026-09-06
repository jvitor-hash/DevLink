import { db } from "@/client";
import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq } from "drizzle-orm";

export const ProjectService = {
  ...crud(schemas.project),

}
