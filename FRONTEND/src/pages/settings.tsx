import { useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use_current_user";
import { useUserPreferences } from "@/features/settings/hooks/use_user_preferences";
import { SettingsProfileForm } from "@/features/settings/components/settings_profile_form";
import { SettingsPreferencesForm } from "@/features/settings/components/settings_preferences_form";
import { SettingsNotificationsForm } from "@/features/settings/components/settings_notifications_form";
import { SettingsAccountForm } from "@/features/settings/components/settings_account_form";
import { User, Bell, Sliders, Shield } from "react-feather";

type SettingsTab = "profile" | "preferences" | "notifications" | "account";

export default function Settings() {
  const user = useCurrentUser();
  const { preferences, updatePreferences } = useUserPreferences(user?.id);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center text-sm text-(--text-muted)">
        Carregando informações do usuário...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 flex flex-col gap-6">
      <header className="border-b border-(--border-subtle) pb-4">
        <h1 className="text-2xl font-bold text-(--text-primary)">Configurações</h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          Gerencie seu perfil, preferências de trabalho, notificações e segurança da conta.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1 border border-(--border-subtle) bg-(--surface-1) p-2 rounded-md">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${
              activeTab === "profile"
                ? "bg-(--primary)/15 text-(--primary) font-semibold"
                : "text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-primary)"
            }`}
          >
            <User size={16} /> Perfil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${
              activeTab === "preferences"
                ? "bg-(--primary)/15 text-(--primary) font-semibold"
                : "text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-primary)"
            }`}
          >
            <Sliders size={16} /> Preferências de Projetos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${
              activeTab === "notifications"
                ? "bg-(--primary)/15 text-(--primary) font-semibold"
                : "text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-primary)"
            }`}
          >
            <Bell size={16} /> Notificações
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${
              activeTab === "account"
                ? "bg-(--primary)/15 text-(--primary) font-semibold"
                : "text-(--text-secondary) hover:bg-(--surface-2) hover:text-(--text-primary)"
            }`}
          >
            <Shield size={16} /> Conta
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full">
          {activeTab === "profile" && (
            <SettingsProfileForm
              initialName={user.name}
              initialBio={user.bio}
            />
          )}

          {activeTab === "preferences" && (
            <SettingsPreferencesForm
              preferences={preferences}
              onSave={updatePreferences}
            />
          )}

          {activeTab === "notifications" && (
            <SettingsNotificationsForm
              preferences={preferences}
              onSave={updatePreferences}
            />
          )}

          {activeTab === "account" && (
            <SettingsAccountForm email={user.email} />
          )}
        </main>
      </div>
    </div>
  );
}
