import { ULIB } from "@/shared/ui";
import type { MessageDTO, OfferStatus } from "@/shared/types/database";
import { Check, X, DollarSign, Calendar } from "react-feather";

interface OfferCardProps {
  message: MessageDTO;
  isMine: boolean;
  onRespond?: (messageId: string, status: OfferStatus) => void;
}

export function OfferCard({ message, isMine, onRespond }: OfferCardProps) {
  const status = message.offerStatus ?? "PENDING";

  return (
    <div className="mt-2 p-3 bg-(--surface-1) border border-(--border) rounded-md flex flex-col gap-2 max-w-xs shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-(--border-subtle)">
        <span className="text-xs font-semibold uppercase tracking-wider text-(--primary)">
          Proposta Formal
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            status === "ACCEPTED"
              ? "bg-(--success)/20 text-(--success)"
              : status === "REFUSED"
              ? "bg-(--error)/20 text-(--error)"
              : "bg-(--warning)/20 text-(--warning)"
          }`}
        >
          {status === "ACCEPTED"
            ? "Aceita"
            : status === "REFUSED"
            ? "Recusada"
            : "Pendente"}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-xs">
        {message.offerMoney !== undefined && message.offerMoney !== null && (
          <div className="flex items-center gap-1.5 text-(--text-primary)">
            <DollarSign size={14} className="text-(--success)" />
            <span className="font-bold">
              R$ {Number(message.offerMoney).toLocaleString()}
            </span>
          </div>
        )}

        {message.offerDeadline && (
          <div className="flex items-center gap-1.5 text-(--text-secondary)">
            <Calendar size={14} className="text-(--text-muted)" />
            <span>Prazo: {new Date(message.offerDeadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {!isMine && status === "PENDING" && onRespond && (
        <div className="flex items-center gap-2 pt-1 border-t border-(--border-subtle) mt-1">
          <ULIB.button
            onClick={() => onRespond(message.id, "ACCEPTED")}
            className="flex-1 py-1 text-xs flex items-center justify-center gap-1"
          >
            <Check size={12} /> Aceitar
          </ULIB.button>
          <ULIB.button
            tone="secondary"
            onClick={() => onRespond(message.id, "REFUSED")}
            className="flex-1 py-1 text-xs flex items-center justify-center gap-1"
          >
            <X size={12} /> Recusar
          </ULIB.button>
        </div>
      )}
    </div>
  );
}
