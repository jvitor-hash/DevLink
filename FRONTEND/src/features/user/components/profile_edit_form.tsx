import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { toast } from "@/shared/utils/toast_store";

export function ProfileEditForm({ initialName, initialBio, onSave, onCancel }) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome não pode estar vazio.");
      return;
    }

    setSaving(true);
    const success = await onSave({ name, bio });
    setSaving(false);

    if (success) {
      toast.success("Perfil atualizado com sucesso!");
    } else {
      toast.error("Erro ao atualizar perfil.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 border border-(--border)">
      <ULIB.field>
        <ULIB.label htmlFor="profile-name" required>Nome</ULIB.label>
        <ULIB.input
          id="profile-name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="profile-bio">Biografia</ULIB.label>
        <ULIB.textarea
          id="profile-bio"
          value={bio}
          onChange={(e: any) => setBio(e.target.value)}
          placeholder="Fale um pouco sobre suas habilidades e experiência"
          rows={3}
        />
      </ULIB.field>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <ULIB.button type="button" tone="secondary" onClick={onCancel} disabled={saving}>Cancelar</ULIB.button>
        )}
        <ULIB.button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Alterações"}
        </ULIB.button>
      </div>
    </form>
  );
}
