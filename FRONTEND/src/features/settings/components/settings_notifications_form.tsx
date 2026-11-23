import { useState } from "react";
import { ULIB } from "@/shared/ui";
import type { UserPreferenceDTO, UserPreferenceUpdate } from "@/shared/types/database";

interface SettingsNotificationsFormProps {
  preferences: UserPreferenceDTO | null;
  onSave: (data: UserPreferenceUpdate) => Promise<boolean>;
}

export function SettingsNotificationsForm({
  preferences,
  onSave,
}: SettingsNotificationsFormProps) {
  const [emailNotif, setEmailNotif] = useState(preferences?.email_notifications ?? true);
  const [msgNotif, setMsgNotif] = useState(preferences?.message_notifications ?? true);
  const [projNotif, setProjNotif] = useState(preferences?.project_notifications ?? true);
  const [revNotif, setRevNotif] = useState(preferences?.review_notifications ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      email_notifications: emailNotif,
      message_notifications: msgNotif,
      project_notifications: projNotif,
      review_notifications: revNotif,
    });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-5 border border-(--border) bg-(--surface-1) rounded-md max-w-xl"
    >
      <div>
        <h3 className="text-base font-semibold text-(--text-primary)">Preferências de Notificações</h3>
        <p className="text-xs text-(--text-secondary) mt-1">
          Escolha quais alertas você deseja receber em tempo real e por e-mail.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between p-3 border border-(--border-subtle) rounded-md cursor-pointer hover:bg-(--surface-2)/40 transition-colors">
          <div>
            <span className="text-sm font-medium block">Notificações por E-mail</span>
            <span className="text-xs text-(--text-muted)">Receber resumos e atualizações importantes por e-mail.</span>
          </div>
          <input
            type="checkbox"
            checked={emailNotif}
            onChange={(e) => setEmailNotif(e.target.checked)}
            className="w-4 h-4 rounded text-(--primary)"
          />
        </label>

        <label className="flex items-center justify-between p-3 border border-(--border-subtle) rounded-md cursor-pointer hover:bg-(--surface-2)/40 transition-colors">
          <div>
            <span className="text-sm font-medium block">Mensagens de Chat</span>
            <span className="text-xs text-(--text-muted)">Alertar quando receber novas mensagens ou propostas.</span>
          </div>
          <input
            type="checkbox"
            checked={msgNotif}
            onChange={(e) => setMsgNotif(e.target.checked)}
            className="w-4 h-4 rounded text-(--primary)"
          />
        </label>

        <label className="flex items-center justify-between p-3 border border-(--border-subtle) rounded-md cursor-pointer hover:bg-(--surface-2)/40 transition-colors">
          <div>
            <span className="text-sm font-medium block">Atualizações de Projetos</span>
            <span className="text-xs text-(--text-muted)">Notificar quando projetos salvos ou vinculados mudarem de status.</span>
          </div>
          <input
            type="checkbox"
            checked={projNotif}
            onChange={(e) => setProjNotif(e.target.checked)}
            className="w-4 h-4 rounded text-(--primary)"
          />
        </label>

        <label className="flex items-center justify-between p-3 border border-(--border-subtle) rounded-md cursor-pointer hover:bg-(--surface-2)/40 transition-colors">
          <div>
            <span className="text-sm font-medium block">Avaliações Recebidas</span>
            <span className="text-xs text-(--text-muted)">Alertar quando um cliente ou colaborador publicar uma avaliação.</span>
          </div>
          <input
            type="checkbox"
            checked={revNotif}
            onChange={(e) => setRevNotif(e.target.checked)}
            className="w-4 h-4 rounded text-(--primary)"
          />
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <ULIB.button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Preferências"}
        </ULIB.button>
      </div>
    </form>
  );
}
