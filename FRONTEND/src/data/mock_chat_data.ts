export interface ChatMessage {
  id: string;
  userId: string;
  receipientId: string;
  message: string;
  sentAt: Date;
  readAt?: Date | null;
}

export interface ChatConversation {
  id: string;
  projectId: string;
  userId: string;
  receipientId: string;
  lastMessage: string;
  timestamp: Date;
  startedAt: Date;
  unreadMessages: number;
  messages: ChatMessage[];
}

export const mockChatConversations: ChatConversation[] = [
  {
    id: "conversation-001",
    projectId: "project-001",
    userId: "user-001",
    receipientId: "user-002",
    lastMessage: "I'll send the updated designs tomorrow.",
    timestamp: new Date("2026-10-02T14:30:00"),
    startedAt: new Date("2026-10-01T09:15:00"),
    unreadMessages: 2,
    messages: [
      {
        id: "message-001",
        userId: "user-001",
        receipientId: "user-002",
        message: "Hey! How is the project going?",
        sentAt: new Date("2026-10-01T09:15:00"),
        readAt: new Date("2026-10-01T09:20:00"),
      },
      {
        id: "message-002",
        userId: "user-002",
        receipientId: "user-001",
        message: "It's going well. I'm finishing the latest designs.",
        sentAt: new Date("2026-10-02T14:10:00"),
        readAt: null,
      },
      {
        id: "message-003",
        userId: "user-002",
        receipientId: "user-001",
        message: "I'll send the updated designs tomorrow.",
        sentAt: new Date("2026-10-02T14:30:00"),
        readAt: null,
      },
    ],
  },
  {
    id: "conversation-002",
    projectId: "project-002",
    userId: "user-003",
    receipientId: "user-004",
    lastMessage: "Sounds good, let's go with that approach.",
    timestamp: new Date("2026-10-02T16:45:00"),
    startedAt: new Date("2026-09-30T11:00:00"),
    unreadMessages: 0,
    messages: [
      {
        id: "message-004",
        userId: "user-003",
        receipientId: "user-004",
        message: "I think we should simplify the onboarding flow.",
        sentAt: new Date("2026-09-30T11:00:00"),
        readAt: new Date("2026-09-30T11:05:00"),
      },
      {
        id: "message-005",
        userId: "user-004",
        receipientId: "user-003",
        message: "Agreed. I'll update the prototype.",
        sentAt: new Date("2026-10-02T16:30:00"),
        readAt: new Date("2026-10-02T16:40:00"),
      },
      {
        id: "message-006",
        userId: "user-003",
        receipientId: "user-004",
        message: "Sounds good, let's go with that approach.",
        sentAt: new Date("2026-10-02T16:45:00"),
        readAt: new Date("2026-10-02T16:46:00"),
      },
    ],
  },
];
