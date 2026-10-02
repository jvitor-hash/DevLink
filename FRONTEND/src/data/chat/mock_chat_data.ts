export type ChatRole = "programmer" | "client";

export interface ChatUser {
  id: string;
  name: string;
  role: ChatRole;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
}

export interface ChatConversation {
  id: string;
  projectId?: string;
  title: string;
  participants: ChatUser[];
  lastMessage: ChatMessage;
  unreadCount: number;
  createdAt: string;
}

export const MOCK_CURRENT_USER: ChatUser = {
  id: "user-1",
  name: "Ana (Programadora)",
  role: "programmer",
  avatar: "https://i.pravatar.cc/150?u=ana",
};

export const MOCK_PROGRAMMERS: ChatUser[] = [
  { id: "prog-1", name: "Ana (Programadora)", role: "programmer", avatar: "https://i.pravatar.cc/150?u=ana" },
  { id: "prog-2", name: "Bruno (Dev)", role: "programmer", avatar: "https://i.pravatar.cc/150?u=bruno" },
];

export const MOCK_CLIENTS: ChatUser[] = [
  { id: "client-1", name: "Carlos (Cliente)", role: "client", avatar: "https://i.pravatar.cc/150?u=carlos" },
];

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-1",
    projectId: "proj-1",
    title: "Projeto Alpha",
    participants: [MOCK_CURRENT_USER, MOCK_CLIENTS[0]],
    lastMessage: { id: "m-1", conversationId: "conv-1", senderId: "client-1", text: "Olá, quando podemos discutir os requisitos?", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: false, delivered: true },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "conv-2",
    projectId: "proj-2",
    title: "Projeto Beta",
    participants: [MOCK_CURRENT_USER, MOCK_PROGRAMMERS[1]],
    lastMessage: { id: "m-2", conversationId: "conv-2", senderId: "prog-2", text: "Enviei a proposta atualizada.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true, delivered: true },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    { id: "m-1", conversationId: "conv-1", senderId: "client-1", text: "Olá, quando podemos discutir os requisitos?", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: false, delivered: true },
    { id: "m-2", conversationId: "conv-1", senderId: "user-1", text: "Podemos marcar uma chamada para amanhã às 14h.", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), read: true, delivered: true },
    { id: "m-3", conversationId: "conv-1", senderId: "client-1", text: "Perfeito, te espero.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: false, delivered: true },
  ],
  "conv-2": [
    { id: "m-2", conversationId: "conv-2", senderId: "prog-2", text: "Enviei a proposta atualizada no chat.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true, delivered: true },
    { id: "m-4", conversationId: "conv-2", senderId: "user-1", text: "Recebi, vou analisar.", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), read: true, delivered: true },
  ],
};
