import { Toggle } from "@/components/ui/toggle_component";

type SettingsNotificationProps = {
  preference?: Partial<Record<NotificationKey, boolean>>;
  onChange: (changes: Partial<Record<NotificationKey, boolean>>) => void;
};

type NotificationKey = "project_notifications" | "message_notifications" | "review_notifications" | "email_notifications";

export default function SettingsNotification({ preference, onChange }: SettingsNotificationProps) {
  const notifications: ReadonlyArray<readonly [NotificationKey, string]> = [
    ["project_notifications", "Novos projetos"],
    ["message_notifications", "Mensagens"],
    ["review_notifications", "Avaliações"],
    ["email_notifications", "E-mail"],
  ];

  const value: Record<NotificationKey, boolean> = {
    project_notifications: true,
    message_notifications: true,
    review_notifications: true,
    email_notifications: true,
    ...preference,
  };

  return (
    <>
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
                checked={value[key]}
                onChange={(checked) => onChange({ [key]: checked })}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
