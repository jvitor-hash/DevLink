export type UserRole = "CLIENT" | "PROGRAMMER" | "ADMIN";

export type ProgrammingLanguage =
  | "CSHARP"
  | "NODE_JS"
  | "JAVA"
  | "GO"
  | "PYTHON"
  | "TYPESCRIPT"
  | "JAVASCRIPT"
  | "PHP"
  | "RUST"
  | "KOTLIN"
  | "SWIFT"
  | "OTHER";

export type PlatformType = "WEB" | "DESKTOP" | "MOBILE";

export type ProjectStatus =
  | "OPEN"
  | "NEGOTIATING"
  | "IN_DEVELOPMENT"
  | "COMPLETED"
  | "CANCELLED";

export type TicketStatus = "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "NEW_PROJECT"
  | "PROJECT_UPDATE"
  | "PROJECT_COMPLETED"
  | "PROJECT_CANCELLED"
  | "TICKET_SAVED"
  | "SYSTEM";

export type Audience =
  | "CLIENTS"
  | "INTERNAL_TOOL"
  | "BUSINESSES"
  | "STUDENTS"
  | "ADMINISTRATORS"
  | "RESEARCHER";

export interface PaginationParams {
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | null | string[] | undefined;
}

export type ListParams = PaginationParams & {
  q?: string;
  category?: string;
  sub_category?: string;
  clientId?: string;
  audience?: string;
  platforms?: string[];
  primaryLanguage?: string;
  status?: string;
  excludeStatuses?: string[];
  minBudget?: number;
  maxBudget?: number;
};

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

// User Models
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  bio?: string | null;
  image?: string | null;
  role?: UserRole | string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}



export interface ProjectDTO {
  id: string;
  clientId: string;
  programmerId?: string | null;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  primaryLanguage: ProgrammingLanguage;
  platforms: PlatformType[];
  problem?: string | null;
  user_actions?: string | null;
  affectedUsers?: string | null;
  northQuestion?: string | null;
  hypothesis?: string | null;
  audiencePainPoints?: string | null;
  audienceAssumptions?: string | null;
  notAudience?: string | null;
  requirements?: string | null;
  successCriteria?: string | null;
  valueProposition?: string | null;
  differentiation?: string | null;
  status: ProjectStatus;
  audience: Audience;
  minBudget: number;
  maxBudget: number;
  saveTotalCount: number;
  deadline?: string | Date | null;
  completedAt?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface ProjectCreate {
  clientId?: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  primaryLanguage?: ProgrammingLanguage;
  platforms: PlatformType[];
  status?: ProjectStatus;
  audience?: Audience;
  minBudget?: number;
  maxBudget?: number;
  deadline?: string | null;
  programmerId?: string | null;
  problem?: string | null;
  user_actions?: string | null;
  affectedUsers?: string | null;
  northQuestion?: string | null;
  hypothesis?: string | null;
  audiencePainPoints?: string | null;
  audienceAssumptions?: string | null;
  notAudience?: string | null;
  requirements?: string | null;
  successCriteria?: string | null;
  valueProposition?: string | null;
  differentiation?: string | null;
}

export interface ProjectUpdate {
  clientId?: string;
  programmerId?: string | null;
  title?: string;
  description?: string;
  category?: string;
  sub_category?: string;
  primaryLanguage?: ProgrammingLanguage;
  platforms?: PlatformType[];
  status?: ProjectStatus;
  audience?: Audience;
  minBudget?: number;
  maxBudget?: number;
  deadline?: string | null;
  completedAt?: string | null;
  problem?: string | null;
  user_actions?: string | null;
  affectedUsers?: string | null;
  northQuestion?: string | null;
  hypothesis?: string | null;
  audiencePainPoints?: string | null;
  audienceAssumptions?: string | null;
  notAudience?: string | null;
  requirements?: string | null;
  successCriteria?: string | null;
  valueProposition?: string | null;
  differentiation?: string | null;
}

// Notification Models
export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string | null;
  isRead: boolean;
  createdAt?: string | Date | null;
}

export interface NotificationCreate {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string | null;
  isRead?: boolean;
}

export interface NotificationUpdate {
  userId?: string;
  type?: NotificationType;
  title?: string;
  message?: string;
  projectId?: string | null;
  isRead?: boolean;
}

// Message Models
export interface MessageDTO {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  offerDeadline?: string | Date | null;
  offerStatus?: OfferStatus | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface MessageCreate {
  projectId: string;
  senderId: string;
  content: string;
  isRead?: boolean;
  offerDeadline?: string | null;
}

export interface MessageUpdate {
  projectId?: string;
  senderId?: string;
  content?: string;
  isRead?: boolean;
  offerStatus?: OfferStatus | null;
}

// Todo Models
export interface TodoDTO {
  id: string;
  projectId: string;
  creatorId: string;
  title: string;
  description?: string | null;
  isDone: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface TodoCreate {
  projectId: string;
  title: string;
  description?: string | null;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  isDone?: boolean;
}

// Kanban Ticket Models
export interface TicketDTO {
  id: string;
  projectId: string;
  creatorId: string;
  assigneeId?: string | null;
  title: string;
  description?: string | null;
  status: TicketStatus;
  position: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface TicketCreate {
  projectId: string;
  title: string;
  description?: string | null;
  status?: TicketStatus;
  assigneeId?: string | null;
}

export interface TicketUpdate {
  title?: string;
  description?: string | null;
  status?: TicketStatus;
  position?: number;
  assigneeId?: string | null;
}

// Review Models
export interface ReviewDTO {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewedUserId: string;
  title: string;
  description: string;
  rating: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface ReviewCreate {
  projectId: string;
  reviewerId?: string;
  reviewedUserId: string;
  title: string;
  description: string;
  rating: number;
}

export interface ReviewUpdate {
  projectId?: string;
  reviewerId?: string;
  reviewedUserId?: string;
  title?: string;
  description?: string;
  rating?: number;
}

// Saved Ticket Models
export interface SavedTicketDTO {
  id: string;
  userId: string;
  projectId: string;
  createdAt?: string | Date | null;
}

export interface SavedTicketCreate {
  // The API derives userId from the authenticated session.
  userId?: string;
  projectId: string;
}

export interface SavedTicketUpdate {
  userId?: string;
  projectId?: string;
}

// User Preference Models
export interface UserPreferenceDTO {
  id: string;
  userId: string;
  email_notifications: boolean;
  message_notifications: boolean;
  project_notifications: boolean;
  review_notifications: boolean;
  language: "ALL" | ProgrammingLanguage;
  platform: "ALL" | PlatformType;
  maxDeadlineDays: string;
  minBudget: number;
  maxBudget: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface UserPreferenceCreate {
  email_notifications?: boolean;
  message_notifications?: boolean;
  project_notifications?: boolean;
  review_notifications?: boolean;
  language?: "ALL" | ProgrammingLanguage;
  platform?: "ALL" | PlatformType;
  maxDeadlineDays?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface UserPreferenceUpdate {
  email_notifications?: boolean;
  message_notifications?: boolean;
  project_notifications?: boolean;
  review_notifications?: boolean;
  language?: "ALL" | ProgrammingLanguage;
  platform?: "ALL" | PlatformType;
  maxDeadlineDays?: string;
  minBudget?: number;
  maxBudget?: number;
}

// Public User Models
export interface PublicUserDTO {
  id: string;
  name: string;
  bio?: string | null;
  image?: string | null;
  role?: string | null;
}

export interface ProminentClientDTO extends PublicUserDTO {
  projectCount: number;
}

export const BASE_URL = import.meta.env.API_URL || "http://localhost:3333";
