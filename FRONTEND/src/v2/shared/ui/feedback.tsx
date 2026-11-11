import { X } from "react-feather";
import type { ReactNode } from "react";
export function Banner({ children, tone = "info", onDismiss }: { children: ReactNode; tone?: "success" | "error" | "info" | "warning"; onDismiss?: () => void }) { return <div role="status" className={`flex items-center gap-2 rounded-sm border px-4 py-3 text-sm text-(--${tone})`}><span className="flex-1">{children}</span>{onDismiss && <button type="button" aria-label="Dismiss" onClick={onDismiss}><X size={16} /></button>}</div>; }
export function RouteFallback() { return <div className="grid min-h-[40vh] place-items-center"><p>Carregando...</p></div>; }
