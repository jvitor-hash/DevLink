import { message } from "@/database/schema/message_schema";
import { crud } from "@/modules/crud_factory";

export const MessageService = {
  ...crud(message)
};
