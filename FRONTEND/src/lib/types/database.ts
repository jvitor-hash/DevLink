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

export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "PROJECT_UPDATE"
  | "PROJECT_COMPLETED"
  | "PROJECT_CANCELLED"
  | "TICKET_SAVED"
  | "SYSTEM";

export type Audience =
  | "Clientes"
  | "Ferramenta Interna";

export interface PaginationParams {
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | null | undefined;
}

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
  status: ProjectStatus;
  audience: Audience;
  minBudget: number;
  maxBudget: number;
  completedAt?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface ProjectCreate {
  clientId: string;
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
  programmerId?: string | null;
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
  completedAt?: string | null;
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
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface MessageCreate {
  projectId: string;
  senderId: string;
  content: string;
  isRead?: boolean;
}

export interface MessageUpdate {
  projectId?: string;
  senderId?: string;
  content?: string;
  isRead?: boolean;
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
  reviewerId: string;
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
  userId: string;
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
  emailNotifications: boolean;
  messageNotifications: boolean;
  projectNotifications: boolean;
  reviewNotifications: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface UserPreferenceCreate {
  userId: string;
  emailNotifications?: boolean;
  messageNotifications?: boolean;
  projectNotifications?: boolean;
  reviewNotifications?: boolean;
}

export interface UserPreferenceUpdate {
  userId?: string;
  emailNotifications?: boolean;
  messageNotifications?: boolean;
  projectNotifications?: boolean;
  reviewNotifications?: boolean;
}

export const BASE_URL = import.meta.env.API_URL || "http://localhost:3333";
