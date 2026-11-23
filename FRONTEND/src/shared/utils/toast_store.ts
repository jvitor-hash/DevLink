import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
};

type ToastListener = () => void;

class ToastStore {
  private toasts: Toast[] = [];
  private readonly listeners = new Set<ToastListener>();

  subscribe = (listener: ToastListener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  show(variant: ToastVariant, message: string, ttlMs = 4000): string {
    const id = crypto.randomUUID();
    this.toasts = [...this.toasts, { id, variant, message }];
    this.notify();

    setTimeout(() => this.dismiss(id), ttlMs);
    return id;
  }

  success(message: string): string {
    return this.show("success", message);
  }

  error(message: string): string {
    return this.show("error", message, 6000);
  }

  info(message: string): string {
    return this.show("info", message);
  }

  dismiss(id: string): void {
    const next = this.toasts.filter((toast) => toast.id !== id);
    if (next.length !== this.toasts.length) {
      this.toasts = next;
      this.notify();
    }
  }

  getToasts = (): Toast[] => this.toasts;
}

export const toastStore = new ToastStore();

export const toast = {
  success: (message: string): string => toastStore.success(message),
  error: (message: string): string => toastStore.error(message),
  info: (message: string): string => toastStore.info(message),
  dismiss: (id: string): void => toastStore.dismiss(id),
};

export function useToasts(): Toast[] {
  return useSyncExternalStore(toastStore.subscribe, toastStore.getToasts);
}
