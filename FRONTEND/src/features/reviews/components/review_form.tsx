import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { Star } from "react-feather";
import type { ReviewCreate } from "@/shared/types/database";

interface ReviewFormProps {
  projectId: string;
  reviewedUserId: string;
  onSubmit: (data: ReviewCreate) => Promise<any>;
  onCancel?: () => void;
}

export function ReviewForm({
  projectId,
  reviewedUserId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    await onSubmit({
      projectId,
      reviewedUserId,
      rating,
      title: title.trim(),
      description: description.trim(),
    });
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-(--border) bg-(--surface-1) rounded-md flex flex-col gap-4"
    >
      <h3 className="font-semibold text-base">Avaliar Trabalho</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-(--text-muted)">Nota (1 a 5 estrelas)</label>
        <div className="flex items-center gap-1 cursor-pointer">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="p-1 text-amber-400 hover:scale-110 transition-transform"
            >
              <Star
                size={22}
                fill={star <= rating ? "currentColor" : "none"}
                className={star <= rating ? "text-amber-400" : "text-(--border)"}
              />
            </button>
          ))}
          <span className="text-xs font-semibold ml-2 text-(--text-secondary)">
            {rating} de 5
          </span>
        </div>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="rev-title" required>Título da Avaliação</ULIB.label>
        <ULIB.input
          id="rev-title"
          placeholder="Ex: Excelente trabalho e pontualidade"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="rev-desc" required>Comentário</ULIB.label>
        <ULIB.textarea
          id="rev-desc"
          rows={3}
          placeholder="Descreva sua experiência detalhadamente..."
          value={description}
          onChange={(e: any) => setDescription(e.target.value)}
          required
        />
      </ULIB.field>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <ULIB.button type="button" tone="secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </ULIB.button>
        )}
        <ULIB.button type="submit" disabled={submitting}>
          {submitting ? "Enviando..." : "Publicar Avaliação"}
        </ULIB.button>
      </div>
    </form>
  );
}
