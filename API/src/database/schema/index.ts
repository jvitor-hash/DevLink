import { account } from "./account_schema";
import { message } from "./message_schema";
import { notification } from "./notification_schema";
import { project } from "./project_schema";
import { review } from "./review_schemas";
import { savedTicket } from "./saved_ticket_schema";
import { session } from "./session_schema";
import { ticket } from "./ticket_schema";
import { todo } from "./todo_schema";
import { userPreference } from "./user_preferences_schema";
import { user } from "./user_schema";
import { verification } from "./verification_schema";

export const schemas = {
  user,
  account,
  session,
  verification,
  project,
  review,
  notification,
  userPreference,
  message,
  savedTicket,
  todo,
  ticket,
};
