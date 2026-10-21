import Elysia from "elysia";
import { authPlugin } from "@/modules/auth_plugin";
import { SseHub } from "@/modules/sse_hub";

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

// Browsers auto-reconnect after a drop; the hint keeps retries prompt.
const RETRY_HINT_MS = 3000;

export const EventsRouter = new Elysia({ prefix: "/api/v1/events" })
  .use(authPlugin)
  .get("/stream", ({ user }) => {
    const encoder = new TextEncoder();
    let clientId: string | null = null;
    let closed = false;

    const cleanup = () => {
      if (closed) return;
      closed = true;

      if (clientId !== null) {
        SseHub.unregister(clientId);
        clientId = null;
      }
    };

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const writeFn = (chunk: string) => {
          if (closed) {
            throw new Error("SSE stream is closed");
          }

          try {
            controller.enqueue(encoder.encode(chunk));
          } catch (error) {
            cleanup();
            throw error;
          }
        };

        try {
          clientId = SseHub.register(user.id, writeFn);
          controller.enqueue(encoder.encode(`retry: ${RETRY_HINT_MS}\n\n`));
          controller.enqueue(encoder.encode(": connected\n\n"));
        } catch (error) {
          cleanup();
          throw error;
        }
      },
      cancel() {
        cleanup();
      },
    });

    return new Response(stream, { headers: STREAM_HEADERS });
  }, {
    tags: ["Events"],
    auth: true,
  });
