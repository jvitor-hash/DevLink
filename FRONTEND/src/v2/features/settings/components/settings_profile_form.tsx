import { useState } from "react";
import { ULIB } from "@/shared/ui";
import { userService } from "@/features/user/service/user_service";
import { toast } from "@/shared/utils/toast_store";

interface SettingsProfileFormProps {
  initialName: string;
  initialBio?: string | null;
  onSuccess?: () => void;
}

export function SettingsProfileForm({
  initialName,
  initialBio,
  onSuccess,
}: SettingsProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setSaving(true);
    const result = await userService.updateMe({ name: name.trim(), bio: bio.trim() || null });
    setSaving(false);

    if (result.success) {
      toast.success("Perfil atualizado com sucesso!");
      onSuccess?.();
    } else {
      toast.error("Erro ao atualizar perfil.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-5 border border-(--border) bg-(--surface-1) rounded-md max-w-xl"
    >
      <div>
        <h3 className="text-base font-semibold text-(--text-primary)">Informações do Perfil</h3>
        <p className="text-xs text-(--text-secondary) mt-1">
          Estas informações serão visíveis para outros usuários e clientes na plataforma.
        </p>
      </div>

      <ULIB.field>
        <ULIB.label htmlFor="set-name" required>Nome Completo</ULIB.label>
        <ULIB.input
          id="set-name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
          required
        />
      </ULIB.field>

      <ULIB.field>
        <ULIB.label htmlFor="set-bio">Biografia & Habilidades</ULIB.label>
        <ULIB.textarea
          id="set-bio"
          rows={3}
          value={bio}
          onChange={(e: any) => setBio(e.target.value)}
          placeholder="Conte um pouco sobre sua formação, experiência e tecnologias..."
        />
      </ULIB.field>

      <div className="flex justify-end pt-2">
        <ULIB.button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar Perfil"}
        </ULIB.button>
      </div>
    </form>
  );
}
