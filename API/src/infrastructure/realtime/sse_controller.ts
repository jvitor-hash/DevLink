import { SseHub } from "./sse_hub";
import { logger } from "@/modules/logger";

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

const RETRY_HINT_MS = 3000;

export const streamEvents = ({ user }: { user: { id: string } }): Response => {
  const encoder = new TextEncoder();
  let clientId: string | null = null;
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    logger.info("[sse] client disconnected", { userId: user.id, clientId });
    if (clientId) SseHub.unregister(clientId);
    clientId = null;
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        if (closed) throw new Error("SSE stream is closed");
        try { controller.enqueue(encoder.encode(chunk)); }
        catch (error) { cleanup(); throw error; }
      };

      try {
        clientId = SseHub.register(user.id, write);
        logger.info("[sse] client connected", { userId: user.id, clientId });
        write(`retry: ${RETRY_HINT_MS}\n\n`);
        write(": connected\n\n");
      } catch (error) { cleanup(); throw error; }
    },
    cancel: cleanup,
  });

  return new Response(stream, { headers: STREAM_HEADERS });
};
