import { auth } from "@/auth";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { MessageService } from "@/routes/v1/message/service";
import { UserService } from "@/routes/v1/users/service";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { z } from "zod";

type Participant = {
  userId: string
  role: string | null
  projectId: string
  publicKey: string
  ws: any
}

type WsData = {
  userId?: string
  role?: string | null
  projectId?: string
}

const rooms = new Map<string, Set<Participant>>();

const addParticipant = (projectId: string, participant: Participant): Set<Participant> => {
  const room = rooms.get(projectId) ?? new Set<Participant>();
  room.add(participant);
  rooms.set(projectId, room);

  return room;
};

const removeParticipant = (projectId: string, userId: string) => {
  const room = rooms.get(projectId);
  if (!room) return;

  for (const participant of room) {
    if (participant.userId === userId) {
      room.delete(participant);
    }
  }

  if (room.size === 0) rooms.delete(projectId);
};

const broadcast = (projectId: string, payload: object, excludeUserId?: string) => {
  const room = rooms.get(projectId);
  if (!room) return;

  for (const participant of room) {
    if (participant.userId === excludeUserId) continue;
    participant.ws.send(JSON.stringify(payload));
  }
};

// Wire protocol mirrors the message schema: messages carry projectId, senderId,
// content, isRead and the offer fields used for deadline negotiation.
const ClientFrameSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
    projectId: z.uuid(),
    publicKey: z.string().min(1),
  }),
  z.object({
    type: z.literal("leave"),
    projectId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("message"),
    projectId: z.uuid(),
    content: z.string().min(1),
  }),
  z.object({
    type: z.literal("offer"),
    projectId: z.uuid(),
    content: z.string().min(1),
    offerDeadline: z.string(),
  }),
  z.object({
    type: z.literal("offer-response"),
    messageId: z.uuid(),
    projectId: z.uuid(),
    offerStatus: z.enum(["ACCEPTED", "REJECTED"]),
  }),
  z.object({
    type: z.literal("read"),
    projectId: z.uuid(),
    messageIds: z.array(z.string().uuid()).min(1),
  }),
]);

type ClientFrame = z.infer<typeof ClientFrameSchema>;

// Server frames mirror the persisted message row plus control messages.
const ServerFrameSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("joined"),
    projectId: z.string(),
    // userId -> base64 SPKI public key of everyone currently in the room.
    keys: z.record(z.string(), z.string()),
  }),
  z.object({
    type: z.literal("peer-joined"),
    projectId: z.string(),
    userId: z.string(),
    publicKey: z.string(),
  }),
  z.object({
    type: z.literal("peer-left"),
    projectId: z.string(),
    userId: z.string(),
  }),
  z.object({
    type: z.literal("left"),
    projectId: z.string(),
  }),
  z.object({
    type: z.literal("message"),
    id: z.string(),
    projectId: z.string(),
    senderId: z.string(),
    content: z.string(),
    isRead: z.boolean(),
    offerDeadline: z.string().nullable().optional(),
    offerStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).nullable().optional(),
    createdAt: z.union([z.date(), z.string()]).nullable().optional(),
  }),
  z.object({
    type: z.literal("message-update"),
    id: z.string(),
    projectId: z.string(),
    isRead: z.boolean().optional(),
    offerStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).nullable().optional(),
  }),
  z.object({
    type: z.literal("error"),
    error: z.string(),
  }),
]);

type ServerFrame = z.infer<typeof ServerFrameSchema>;

const sendFrame = (ws: any, frame: ServerFrame) => {
  ws.send(JSON.stringify(frame));
};

export const Websocket_Chat = new Elysia()
  .ws("/ws", {
    async beforeHandle(context) {
      const session = await auth.api.getSession({ headers: context.request.headers });
      if (!session) {
        throw new Error("Unauthorized")
      }

      (context as WsData).userId = session.user.id;
      (context as WsData).role = (session.user as { role?: string | null }).role ?? null;
    },

    async message(ws, raw) {
      const parsed = ClientFrameSchema.safeParse(raw);
      if (!parsed.success) {
        sendFrame(ws, { type: "error", error: "Invalid message frame" });
        return;
      }

      const frame = parsed.data as ClientFrame;
      const data = ws.data as WsData;
      const userId = data.userId;
      if (!userId) {
        sendFrame(ws, { type: "error", error: "Unauthorized" });
        return;
      }

      switch (frame.type) {
        case 'join': {
          // Persist the advertised key so peers can derive secrets even when
          // this user is offline (history catch-up).
          await UserService.updatePublicKey(userId, frame.publicKey).catch(() => undefined);

          removeParticipant(frame.projectId, userId);

          const participant: Participant = {
            userId,
            role: data.role ?? null,
            projectId: frame.projectId,
            publicKey: frame.publicKey,
            ws,
          };

          // Announce the newcomer to peers BEFORE answering, so the joiner's
          // key map can include anyone already in the room.
          broadcast(frame.projectId, {
            type: "peer-joined",
            projectId: frame.projectId,
            userId,
            publicKey: frame.publicKey,
          }, userId);

          const room = addParticipant(frame.projectId, participant);
          const keys: Record<string, string> = {};
          for (const peer of room) keys[peer.userId] = peer.publicKey;

          // Room may lack the other participant; fall back to their persisted key.
          const project = await db
            .select({ clientId: schemas.project.clientId, programmerId: schemas.project.programmerId })
            .from(schemas.project)
            .where(eq(schemas.project.id, frame.projectId))
            .limit(1);

          const participantIds = [project[0]?.clientId, project[0]?.programmerId].filter(
            (id): id is string => Boolean(id) && id !== userId,
          );

          for (const peerId of participantIds) {
            if (keys[peerId]) continue;

            const persisted = await UserService.findPublicKeyById(peerId).catch(() => null);
            if (persisted) keys[peerId] = persisted;
          }

          data.projectId = frame.projectId;
          sendFrame(ws, { type: "joined", projectId: frame.projectId, keys });
          break;
        }

        case 'leave': {
          removeParticipant(frame.projectId, userId);
          broadcast(frame.projectId, { type: "peer-left", projectId: frame.projectId, userId });
          sendFrame(ws, { type: "left", projectId: frame.projectId });
          break;
        }

        case 'message': {
          try {
            const created = await MessageService.createForProject({
              projectId: frame.projectId,
              senderId: userId,
              content: frame.content,
            });

            const payload = { type: "message", ...created };
            broadcast(frame.projectId, payload);
          } catch {
            sendFrame(ws, { type: "error", error: "Failed to send message" });
          }
          break;
        }

        case 'offer': {
          // Offers are a programmer-only action.
          if (data.role !== "PROGRAMMER") {
            sendFrame(ws, { type: "error", error: "Only programmers can send offers" });
            return;
          }

          try {
            const created = await MessageService.createForProject({
              projectId: frame.projectId,
              senderId: userId,
              content: frame.content,
              offerDeadline: frame.offerDeadline,
            });

            const payload = { type: "message", ...created };
            broadcast(frame.projectId, payload);
          } catch {
            sendFrame(ws, { type: "error", error: "Failed to send offer" });
          }
          break;
        }

        case 'offer-response': {
          try {
            const updated = await MessageService.updateForUser(frame.messageId, userId, {
              offerStatus: frame.offerStatus,
            });

            const payload = {
              type: "message-update",
              id: updated.id,
              projectId: updated.projectId,
              offerStatus: updated.offerStatus,
            };
            broadcast(frame.projectId, payload);
          } catch {
            sendFrame(ws, { type: "error", error: "Failed to update offer" });
          }
          break;
        }

        case 'read': {
          try {
            for (const messageId of frame.messageIds) {
              await MessageService.updateForUser(messageId, userId, { isRead: true });
            }

            const payload = {
              type: "message-update",
              projectId: frame.projectId,
              isRead: true,
            };
            broadcast(frame.projectId, payload, userId);
          } catch {
            sendFrame(ws, { type: "error", error: "Failed to mark messages read" });
          }
          break;
        }
      }
    },

    close(ws) {
      const data = ws.data as WsData;
      if (data.userId && data.projectId) {
        removeParticipant(data.projectId, data.userId);
        broadcast(data.projectId, { type: "peer-left", projectId: data.projectId, userId: data.userId });
      }
    }
  });
