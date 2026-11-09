type Handler = (payload: unknown) => void;

class EventBus {
  private handlers: Record<string, Handler[]> = {};

  subscribe(event: string, handler: Handler) {
    (this.handlers[event] ??= []).push(handler);
  }

  publish(event: string, payload?: unknown) {
    this.handlers[event]?.forEach(h => h(payload));
  }
}