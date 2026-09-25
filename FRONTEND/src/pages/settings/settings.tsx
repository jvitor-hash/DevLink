import Button from "@/components/ui/button_component";
import { useState } from "react";
import SettingsProfile from "./settings_profile";
import { authService } from "@/services/auth_service";
import { useLoaderData } from "react-router-dom";
import type { UserDTO, UserPreferenceUpdate } from "@/lib/types/database";
import SettingsNotification from "./settings_notification";
import SettingsProjectPreferences from "./settings_project_preferences";
import SettingsAccount from "./settings_account";
import { userPreferenceService } from "@/services/user_preference_service";

const SECTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "PROFILE", label: "Perfil" },
  { key: "NOTIFICATIONS", label: "Notificações" },
  { key: "PROJECT_PREFS", label: "Preferências de projetos" },
  { key: "ACCOUNT", label: "Conta" },
];

export async function SettingsLoader() {
  const User = await authService.getCurrentUser(); // Replace this later with a global state user
  return { User };
}

type PendingChanges = UserPreferenceUpdate;

export default function SettingsPage() {
  const loaderData = useLoaderData<typeof SettingsLoader>();
  const [section, setSection] = useState<string | null>(SECTIONS[0]["key"] ?? null);
  const user: UserDTO | null = loaderData.User ?? null;
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; message: string; } | null>(null);
  const [pending, setPending] = useState<PendingChanges | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [unsaved, setUnsaved] = useState<boolean>(false);

  const saveChanges = async (): Promise<void> => {
    if (!user || !unsaved || !pending) return;

    setIsSaving(true);

    try {
      const preferences = pending;

      // if (name !== undefined || bio !== undefined || image !== undefined) {
      //   const updatedUser = await userService.updateMe({ name, bio, image });
      //   authService.updateCachedUser(updatedUser);
      // }

      if (Object.keys(preferences).length > 0) {
        await userPreferenceService.updateByUser(user.id, preferences);
      }

      setPending({});
      setUnsaved(false);
      setSaveFeedback({ ok: true, message: "Todas alterações salvas" });
    } catch (error) {
      setSaveFeedback({ ok: false, message: `Falha ao salvar as preferências. ${error}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsavedChanges = (changes: PendingChanges) => {
    console.log(changes);
    setPending((prev) => ({ ...prev, ...changes }));
    setUnsaved(true);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="mb-8 text-3xl font-bold">Configurações</h1>

        <p className="text-(--text-muted)">Não foi possível carregar suas configurações.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Configurações</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Section nav */}
        <aside className="h-fit rounded-md border border-(--border-subtle) bg-(--surface-1) p-4">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`shrink-0 rounded px-3 py-2 text-left text-sm transition-colors hover:cursor-pointer ${
                  section === key
                    ? "bg-(--primary) text-white"
                    : "text-(--text-secondary) hover:bg-(--surface-2)"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Active section panel */}
        <div className="flex flex-col gap-6">
          {section === "PROFILE" && (
            <SettingsProfile
              user={user}
              onChange={(data) => handleUnsavedChanges(data)}
            />
          )}

          {section === "NOTIFICATIONS" && (
            <SettingsNotification
              onChange={(data) => handleUnsavedChanges(data)}
            />
          )}

          {section === "PROJECT_PREFS" && (
            <SettingsProjectPreferences
              onChange={(data) => handleUnsavedChanges(data)}
            />
          )}

          {section === "ACCOUNT" && <SettingsAccount user={user} />}

          {/* Sticky save bar */}
          <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 shadow-lg">
            <p
              className={`text-sm ${saveFeedback ? (saveFeedback.ok ? "text-(--success)" : "text-(--error)") : unsaved ? "text-(--warning)" : "text-(--text-muted)"}`}
            >
              {saveFeedback
                ? saveFeedback.message
                : unsaved
                  ? "Alterações não salvas"
                  : "Tudo salvo"}
            </p>

            <Button
              label={isSaving ? "Salvando..." : "Salvar"}
              buttonType="button"
              colorType="primary"
              disabled={isSaving || !unsaved}
              onClick={() => void saveChanges()}
              dataTestId="save-preferences-btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
