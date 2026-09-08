import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";

export const UserPreferenceService = {
  ...crud(schemas.userPreference)
}
