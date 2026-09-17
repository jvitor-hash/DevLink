import { useEffect, useState } from "react";
import { authService } from "@/services/auth_service";
import { userPreferenceService } from "@/services/user_preference_service";
import { Toggle } from "@/components/ui/toggle_component";
import Button from "@/components/ui/button_component";
import Select from "@/components/ui/select_component";
import Input from "@/components/ui/input_component";
import type { ProgrammingLanguage, PlatformType, UserDTO, UserPreferenceDTO } from "@/lib/types/database";

const LANGUAGE_LABELS: Record<string, string> = {
  ALL: "Todas",
  CSHARP: "C#",
  NODE_JS: "Node.js",
  JAVA: "Java",
  GO: "Go",
  PYTHON: "Python",
  TYPESCRIPT: "TypeScript",
  JAVASCRIPT: "JavaScript",
  PHP: "PHP",
  RUST: "Rust",
  KOTLIN: "Kotlin",
  SWIFT: "Swift",
  OTHER: "Outra",
};

const PLATFORM_LABELS: Record<string, string> = {
  ALL: "Todas",
  WEB: "Web",
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [preference, setPreference] = useState<UserPreferenceDTO | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveButtonLabel, setSaveButtonLabel] = useState<string>("Salvar");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      const cachedUser = authService.getCachedUser();

      try {
        const currentUser = cachedUser ?? (await authService.getCurrentUser());
        setUser(currentUser);

        if (currentUser) {
          const list = await userPreferenceService.list({ limit: 1 });
          setPreference(list[0] ?? null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const persist = async (next: UserPreferenceDTO): Promise<void> => {
    setIsSaving(true);
    setSaveButtonLabel("Salvando...");
    setStatusMessage(null);

    const payload = {
      email_notifications: next.email_notifications,
      message_notifications: next.message_notifications,
      project_notifications: next.project_notifications,
      review_notifications: next.review_notifications,
      language: next.language,
      platform: next.platform,
      maxDeadlineDays: next.maxDeadlineDays,
      minBudget: next.minBudget,
      maxBudget: next.maxBudget,
    };

    try {
      const saved = preference
        ? await userPreferenceService.update(preference.id, payload)
        : await userPreferenceService.create(payload);
      setPreference(saved);
      setStatusMessage("Preferencias salvas.");
    } catch (saveError) {
      setStatusMessage(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar as preferencias.");
    } finally {
      setIsSaving(false);
      setSaveButtonLabel("Salvar");
    }
  };

  const patchPreference = (patch: Partial<UserPreferenceDTO>): void => {
    if (!preference) return;

    // Update local state only; persisting happens on the explicit Save action.
    setPreference({ ...preference, ...patch });
  };

  if (isLoading) {
    return <div className="p-8 text-(--text-muted)">Carregando...</div>;
  }

  if (!user) {
    return <div className="p-8 text-(--text-muted)">Usuario nao encontrado.</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Configuracoes</h1>

      <div className="bg-(--surface-1) rounded-lg p-6 border border-(--border-subtle) mb-6">
        <h2 className="text-xl font-semibold mb-4">Perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Nome</label>
            <p>{user.name}</p>
          </div>

          <div>
            <label className="block mb-2">E-mail</label>
            <p>{user.email}</p>
          </div>

          {user.role && (
            <div>
              <label className="block mb-2">Tipo de usuario:</label>
              <p className="capitalize">{user.role.toLowerCase()}</p>
            </div>
          )}

          {user.bio && (
            <div>
              <label className="block mb-2">Bio</label>
              <p>{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-(--surface-1) rounded-lg p-6 border border-(--border-subtle)">
        <h2 className="text-xl font-semibold mb-4">Notificacoes de projetos</h2>

        {statusMessage && <p className="mb-3 text-sm text-(--info)">{statusMessage}</p>}

        {!preference ? (
          <p className="text-(--text-muted)">Nenhuma preferencia salva ainda.</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {([
                ["project_notifications", "Novos projetos"],
                ["message_notifications", "Mensagens"],
                ["review_notifications", "Avaliacoes"],
                ["email_notifications", "E-mail"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between border border-(--border-subtle) rounded px-4 py-3">
                  <span>{label}</span>
                  <Toggle checked={preference[key]} onChange={(checked) => patchPreference({ [key]: checked })} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Idioma preferido</label>
                <Select
                  name="language"
                  defaultValue={preference.language}
                  labels={LANGUAGE_LABELS}
                  onChange={(e) => patchPreference({ language: e.currentTarget.value as "ALL" | ProgrammingLanguage })}
                />
              </div>

              <div>
                <label className="block mb-2">Plataforma preferida</label>
                <Select
                  name="platform"
                  defaultValue={preference.platform}
                  labels={PLATFORM_LABELS}
                  onChange={(e) => patchPreference({ platform: e.currentTarget.value as "ALL" | PlatformType })}
                />
              </div>

              <div>
                <label className="block mb-2">Prazo maximo (dias)</label>
                <Input
                  label=""
                  name="maxDeadlineDays"
                  inputType="number"
                  value={preference.maxDeadlineDays}
                  onChange={(e) => patchPreference({ maxDeadlineDays: e.target.value || "365" })}
                />
              </div>

              <div>
                <label className="block mb-2">Orcamento maximo (R$)</label>
                <Input
                  label=""
                  name="maxBudget"
                  inputType="number"
                  value={preference.maxBudget === 0 ? "" : String(preference.maxBudget)}
                  onChange={(e) => patchPreference({ maxBudget: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-end">
                <Button label={saveButtonLabel} buttonType="button" colorType="primary" disabled={isSaving} onClick={() => persist(preference)} dataTestId="save-preferences-btn" />
              </div>
            </div>

            <p className="text-xs text-(--text-muted)">
              Deixe o orcamento maximo vazio para nao filtrar por preco.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
