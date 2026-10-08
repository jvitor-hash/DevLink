import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";

export const ConversationService = {
    ...crud(schemas.conversation)
}
