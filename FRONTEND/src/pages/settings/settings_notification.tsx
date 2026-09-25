import { Toggle } from "@/components/ui/toggle_component";

type SettingsNotificationProps = {
  preference?: Partial<Record<string, boolean>>;
  onChange: (changes: Partial<Record<string, boolean>>) => void;
};

export default function SettingsNotification({
  preference,
  onChange,
}: SettingsNotificationProps) {
  const notifications: ReadonlyArray<readonly [string, string]> = [
    ["project_notifications", "Novos projetos"],
    ["message_notifications", "Mensagens"],
    ["review_notifications", "Avaliações"],
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
