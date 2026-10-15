import Button from "@/components/ui/button_component";
import { useState } from "react";
import SettingsProfile from "./settings_profile";
import { userSingleton } from "@/context/user";
import { useLoaderData } from "react-router-dom";
import type { UserDTO, UserPreferenceDTO, UserPreferenceUpdate } from "@/data/types/database";
import SettingsNotification from "./settings_notification";
import SettingsProjectPreferences from "./settings_project_preferences";
import SettingsAccount from "./settings_account";
import { userPreferenceService } from "@/data/services/user_preference_service";
import { userService } from "@/data/services/user_service";

const SECTIONS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "PROFILE", label: "Perfil" },
  { key: "NOTIFICATIONS", label: "Notificações" },
  { key: "PROJECT_PREFS", label: "Preferências de projetos" },
  { key: "ACCOUNT", label: "Conta" },
];

export async function SettingsLoader() {
  const User = await userSingleton.getCurrentUser();
  let Preference: UserPreferenceDTO | null = null;

  if (User) {
    try {
      Preference = await userPreferenceService.getByUser(User.id);
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  }

  return { User, Preference };
}

type PendingChanges = UserPreferenceUpdate;

type PendingProfile = Partial<Pick<UserDTO, "name" | "bio">>;

export default function SettingsPage() {
  const loaderData = useLoaderData<typeof SettingsLoader>();
  const [section, setSection] = useState<string | null>(SECTIONS[0]["key"] ?? null);
  const user: UserDTO | null = loaderData.User ?? null;
  const preference: UserPreferenceDTO | null = loaderData.Preference ?? null;
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; message: string; } | null>(null);
  const [pending, setPending] = useState<PendingChanges | null>(null);
  const [pendingProfile, setPendingProfile] = useState<PendingProfile | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [unsaved, setUnsaved] = useState<boolean>(false);

  const saveChanges = async (): Promise<void> => {
    if (!user || !unsaved) return;

    setIsSaving(true);

    try {
      if (pendingProfile && Object.keys(pendingProfile).length > 0) {        const updatedUser = await userService.updateMe(pendingProfile);

        userSingleton.updateUser(updatedUser);
      }

      if (pending && Object.keys(pending).length > 0) {
        await userPreferenceService.updateByUser(user.id, pending);
      }

      setPending({});
      setPendingProfile(null);
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
      <div className="mx-auto w-full px-2 py-6 lg:px-8">
        <header className="mb-8">
          <h1 className="gb-heading text-4xl tracking-tight">Configurações</h1>
          <div className="gb-rule-heavy mt-3 h-[3px] bg-(--gb-ink) border-0" />
        </header>
        <div className="gb-glass p-6 shadow-[8px_8px_0px_#161212]">
          <p className="gb-label text-(--gb-stone-600)">Não foi possível carregar suas configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-2 py-4 lg:px-6 lg:py-8">
      <header className="mb-8">
        <h1 className="gb-heading text-4xl tracking-tight">Configurações</h1>
        <div className="gb-rule-heavy mt-3 h-[3px] bg-(--gb-ink) border-0" />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Section nav */}
        <div className="h-fit p-4">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                // active={section === key}
                onClick={() => setSection(key)}
                className="shrink-0 justify-start"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active section panel */}
        <div className="flex flex-col gap-6">
          {section === "PROFILE" && (
            <SettingsProfile
              user={user}
              onChange={(data) => {
                setPendingProfile((prev) => ({ ...prev, ...data }));
                setUnsaved(true);
              }}
            />
          )}

          {section === "NOTIFICATIONS" && (
            <SettingsNotification
              preference={{
                project_notifications: true,
                message_notifications: true,
                review_notifications: true,
                ...preference,
                ...pending,
              }}
              role={user.role}
              onChange={(data) => handleUnsavedChanges(data)}
            />
          )}

          {section === "PROJECT_PREFS" && (
            <SettingsProjectPreferences
              preference={{ ...preference, ...pending }}
              onChange={(data) => handleUnsavedChanges(data)}
            />
          )}

          {section === "ACCOUNT" && <SettingsAccount user={user} />}

          {/* Sticky save bar */}
          <div className="sticky bottom-4 flex items-center justify-between gap-4 p-4 border border-(--border-subtle)">
            <p
              className={`text-sm ${saveFeedback ? (saveFeedback.ok ? "text-(--success)" : "text-(--error)") : unsaved ? "text-(--warning)" : "text-(--gb-stone-400)"}`}
            >
              {saveFeedback
                ? saveFeedback.message
                : unsaved
                  ? "Alterações não salvas"
                  : "Tudo salvo"}
            </p>

            <Button
              label={isSaving ? "SALVANDO..." : "SALVAR"}
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
