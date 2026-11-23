import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { X } from "react-feather";

interface OfferModalProps {
  onClose: () => void;
  onSubmit: (data: { money: number; deadline: string; notes: string }) => Promise<void>;
}

export function OfferModal({ onClose, onSubmit }: OfferModalProps) {
  const [money, setMoney] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!money || !deadline) return;

    setSubmitting(true);
    await onSubmit({
      money: Number(money),
      deadline,
      notes: notes.trim(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-(--surface-1) border border-(--border) p-5 rounded-md flex flex-col gap-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-(--border-subtle)">
          <h3 className="font-semibold text-base">Fazer Proposta de Projeto</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <ULIB.field>
            <ULIB.label htmlFor="offer-money" required>
              Valor da Proposta (R$)
            </ULIB.label>
            <ULIB.input
              id="offer-money"
              type="number"
              placeholder="Ex: 2500"
              value={money}
              onChange={(e: any) => setMoney(e.target.value)}
              required
            />
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="offer-deadline" required>
              Prazo de Entrega Estimado
            </ULIB.label>
            <ULIB.input
              id="offer-deadline"
              type="date"
              value={deadline}
              onChange={(e: any) => setDeadline(e.target.value)}
              required
            />
          </ULIB.field>

          <ULIB.field>
            <ULIB.label htmlFor="offer-notes">Condições ou Observações</ULIB.label>
            <ULIB.textarea
              id="offer-notes"
              placeholder="Descreva o escopo acordado ou termos..."
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              rows={2}
            />
          </ULIB.field>

          <div className="flex justify-end gap-2 pt-2">
            <ULIB.button type="button" tone="secondary" onClick={onClose} disabled={submitting}>
              Cancelar
            </ULIB.button>
            <ULIB.button type="submit" disabled={submitting}>
              {submitting ? "Enviando..." : "Enviar Proposta"}
            </ULIB.button>
          </div>
        </form>
      </div>
    </div>
  );
}
