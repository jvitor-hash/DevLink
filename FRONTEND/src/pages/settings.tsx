import { useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth_service";
import { userPreferenceService } from "@/services/user_preference_service";
import { userService } from "@/services/user_service";
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

type Section = "PROFILE" | "NOTIFICATIONS" | "PROJECT_PREFS" | "LANGUAGE" | "ACCOUNT";

const SECTIONS: Array<{ key: Section; label: string }> = [
  { key: "PROFILE", label: "Perfil" },
  { key: "NOTIFICATIONS", label: "Notificações" },
  { key: "PROJECT_PREFS", label: "Preferências de projetos" },
  { key: "LANGUAGE", label: "Idioma / plataforma" },
  { key: "ACCOUNT", label: "Conta" },
];

type ProfileForm = { name: string; bio: string; image: string };

const profileFormFrom = (user: UserDTO): ProfileForm => ({
  name: user.name,
  bio: user.bio ?? "",
  image: user.image ?? "",
});

export default function SettingsPage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm | null>(null);
  const [preference, setPreference] = useState<UserPreferenceDTO | null>(null);
  const [savedPreference, setSavedPreference] = useState<UserPreferenceDTO | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [section, setSection] = useState<Section>("PROFILE");

  useEffect(() => {
    const load = async (): Promise<void> => {
      const cachedUser = authService.getCachedUser();

      try {
        const currentUser = cachedUser ?? (await authService.getCurrentUser());
        setUser(currentUser);
        setProfileForm(currentUser ? profileFormFrom(currentUser) : null);

        if (currentUser) {
          const list = await userPreferenceService.list({ limit: 1 });
          setPreference(list[0] ?? null);
          setSavedPreference(list[0] ?? null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const profileDirty = useMemo((): boolean => {
    if (!user || !profileForm) return false;
    return JSON.stringify(profileForm) !== JSON.stringify(profileFormFrom(user));
  }, [user, profileForm]);

  const preferencesDirty = useMemo((): boolean => {
    if (!preference) return false;
    return JSON.stringify(preference) !== JSON.stringify(savedPreference);
  }, [preference, savedPreference]);

  const isDirty = profileDirty || preferencesDirty;

  const patchPreference = (patch: Partial<UserPreferenceDTO>): void => {
    if (!preference) return;

    // Update local state only; persisting happens on the explicit Save action.
    setPreference({ ...preference, ...patch });
  };

  const patchProfile = (patch: Partial<ProfileForm>): void => {
    setProfileForm((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const save = async (): Promise<void> => {
    if (!profileForm || !user || isSaving) return;

    setIsSaving(true);
    setSaveFeedback(null);

    try {
      let nextUser: { name: string; bio: string | null; image: string | null } = {
        name: user.name,
        bio: user.bio ?? null,
        image: user.image ?? null,
      };

      if (profileDirty) {
        const updated = await userService.updateMe({
          name: profileForm.name,
          bio: profileForm.bio.trim() === "" ? null : profileForm.bio,
          image: profileForm.image.trim() === "" ? null : profileForm.image,
        });

        nextUser = {
          name: updated.name,
          bio: updated.bio ?? null,
          image: updated.image ?? null,
        };

        authService.updateCachedUser({
          name: nextUser.name,
          bio: nextUser.bio,
          image: nextUser.image,
        });
        setUser({ ...user, name: nextUser.name, bio: nextUser.bio, image: nextUser.image });
        setProfileForm(profileFormFrom({ ...user, name: nextUser.name, bio: nextUser.bio, image: nextUser.image }));
      }

      if (preference && preferencesDirty) {
        const payload = {
          email_notifications: preference.email_notifications,
          message_notifications: preference.message_notifications,
          project_notifications: preference.project_notifications,
          review_notifications: preference.review_notifications,
          language: preference.language,
          platform: preference.platform,
          maxDeadlineDays: preference.maxDeadlineDays,
          minBudget: preference.minBudget,
          maxBudget: preference.maxBudget,
        };

        const saved = savedPreference
          ? await userPreferenceService.update(savedPreference.id, payload)
          : await userPreferenceService.create(payload);

        setPreference(saved);
        setSavedPreference(saved);
      }

      setSaveFeedback({ ok: true, message: "Alterações salvas." });
    } catch (saveError) {
      setSaveFeedback({
        ok: false,
        message: saveError instanceof Error ? saveError.message : "Não foi possível salvar as alterações.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-(--text-muted)">Carregando...</div>;
  }

  if (!user || !profileForm) {
    return <div className="p-8 text-(--text-muted)">Usuário não encontrado.</div>;
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
                  section === key ? "bg-(--primary) text-white" : "text-(--text-secondary) hover:bg-(--surface-2)"
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
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
              <h2 className="mb-4 text-xl font-semibold">Perfil</h2>

              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Nome</label>
                    <Input
                      label=""
                      name="settings-name"
                      inputType="text"
                      value={profileForm.name}
                      onChange={(e) => patchProfile({ name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">E-mail</label>
                    <p className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-3 text-(--text-muted)">
                      {user.email} (somente leitura)
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Bio</label>
                    <Input
                      label=""
                      name="settings-bio"
                      inputType="text"
                      placeholder="Conte um pouco sobre você..."
                      value={profileForm.bio}
                      onChange={(e) => patchProfile({ bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  {profileForm.image ? (
                    <img
                      src={profileForm.image}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full border border-(--border-subtle) object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-2) text-2xl font-bold text-(--text-muted)">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <Input
                    label=""
                    name="settings-image"
                    inputType="text"
                    placeholder="URL da foto"
                    value={profileForm.image}
                    onChange={(e) => patchProfile({ image: e.target.value })}
                  />
                </div>
              </div>
            </section>
          )}

          {section === "NOTIFICATIONS" && (
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
              <h2 className="mb-4 text-xl font-semibold">Notificações</h2>

              {!preference ? (
                <p className="text-(--text-muted)">Nenhuma preferência salva ainda.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {([
                    ["project_notifications", "Novos projetos"],
                    ["message_notifications", "Mensagens"],
                    ["review_notifications", "Avaliações"],
                    ["email_notifications", "E-mail"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between rounded border border-(--border-subtle) px-4 py-3">
                      <span>{label}</span>
                      <Toggle checked={preference[key]} onChange={(checked) => patchPreference({ [key]: checked })} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {section === "PROJECT_PREFS" && (
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
              <h2 className="mb-4 text-xl font-semibold">Preferências de projetos</h2>

              {!preference ? (
                <p className="text-(--text-muted)">Nenhuma preferência salva ainda.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Prazo máximo (dias)</label>
                    <Input
                      label=""
                      name="maxDeadlineDays"
                      inputType="number"
                      value={preference.maxDeadlineDays}
                      onChange={(e) => patchPreference({ maxDeadlineDays: e.target.value || "365" })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Orçamento máximo (R$)</label>
                    <Input
                      label=""
                      name="maxBudget"
                      inputType="number"
                      value={preference.maxBudget === 0 ? "" : String(preference.maxBudget)}
                      onChange={(e) => patchPreference({ maxBudget: Number(e.target.value) || 0 })}
                    />
                  </div>

                  <p className="text-xs text-(--text-muted) sm:col-span-2">
                    Deixe o orçamento máximo vazio para não filtrar por preço.
                  </p>
                </div>
              )}
            </section>
          )}

          {section === "LANGUAGE" && (
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
              <h2 className="mb-4 text-xl font-semibold">Idioma / plataforma</h2>

              {!preference ? (
                <p className="text-(--text-muted)">Nenhuma preferência salva ainda.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Idioma preferido</label>
                    <Select
                      name="language"
                      defaultValue={preference.language}
                      labels={LANGUAGE_LABELS}
                      onChange={(e) => patchPreference({ language: e.currentTarget.value as "ALL" | ProgrammingLanguage })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Plataforma preferida</label>
                    <Select
                      name="platform"
                      defaultValue={preference.platform}
                      labels={PLATFORM_LABELS}
                      onChange={(e) => patchPreference({ platform: e.currentTarget.value as "ALL" | PlatformType })}
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {section === "ACCOUNT" && (
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
              <h2 className="mb-4 text-xl font-semibold">Conta</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-(--text-muted)">E-mail</label>
                  <p>{user.email}</p>
                </div>

                {user.role && (
                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Tipo de usuário</label>
                    <p className="capitalize">{user.role.toLowerCase()}</p>
                  </div>
                )}

                {user.createdAt && (
                  <div>
                    <label className="mb-2 block text-sm text-(--text-muted)">Membro desde</label>
                    <p>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Sticky save bar */}
          <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-md border border-(--border-subtle) bg-(--surface-1) p-4 shadow-lg">
            <p className={`text-sm ${saveFeedback ? (saveFeedback.ok ? "text-(--success)" : "text-(--error)") : isDirty ? "text-(--warning)" : "text-(--text-muted)"}`}>
              {saveFeedback
                ? saveFeedback.message
                : isDirty
                  ? "Alterações não salvas"
                  : "Tudo salvo"}
            </p>

            <Button
              label={isSaving ? "Salvando..." : "Salvar"}
              buttonType="button"
              colorType="primary"
              disabled={isSaving || !isDirty}
              onClick={() => void save()}
              dataTestId="save-preferences-btn"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
