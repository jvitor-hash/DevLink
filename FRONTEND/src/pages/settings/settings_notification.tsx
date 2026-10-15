import { Toggle } from "@/components/form/toggle_component";
import type { UserPreferenceDTO, UserRole } from "@/data/types/database";

type SettingsNotificationProps = {
  preference?: Partial<Pick<UserPreferenceDTO, "project_notifications" | "message_notifications" | "review_notifications">>;
  role?: UserRole | string | null;
  onChange: (changes: Partial<Record<string, boolean>>) => void;
};

export default function SettingsNotification({
  preference,
  role,
  onChange,
}: SettingsNotificationProps) {
  const notifications: ReadonlyArray<readonly [string, string]> = role === "PROGRAMMER"
    ? [
      ["project_notifications", "Novos projetos disponíveis"],
      ["message_notifications", "Mensagens de clientes"],
      ["review_notifications", "Avaliações recebidas"],
    ]
    : [
      ["project_notifications", "Atualizações dos meus projetos"],
      ["message_notifications", "Mensagens de programadores"],
      ["review_notifications", "Avaliações dos projetos"],
    ];

  const options =
    preference ??
    notifications.reduce<Record<string, boolean>>((acc, [key]) => {
      acc[key] = true;
      return acc;
    }, {});

  return (
    <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
      <h2 className="mb-4 text-xl font-semibold">Notificações</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {notifications.map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded border border-(--border-subtle) px-4 py-3"
          >
            <span>{label}</span>

            <Toggle
              checked={options[key] ?? false}
              onChange={(checked) => onChange({ [key]: checked })}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
