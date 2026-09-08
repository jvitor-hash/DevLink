import { account } from "./account_schema";
import { message } from "./message_schema";
import { notification } from "./notification_schema";
import { project } from "./project_schema";
import { review } from "./review_schemas";
import { savedTicket } from "./saved_ticket_schema";
import { session } from "./session_schema";
import { userPreference } from "./user_preferences_schema";
import { user } from "./user_schema";

export const schemas = {
  user,
  account,
  session,
  project,
  review,
  notification,
  userPreference,
  message,
  savedTicket
};
