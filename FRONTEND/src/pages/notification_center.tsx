import { NotificationList } from "@/features/notifications/components/notification_list";

export default function NotificationCenter() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 flex flex-col gap-6">
      <header className="border-b border-(--border-subtle) pb-4">
        <h1 className="text-2xl font-bold text-(--text-primary)">Central de Notificações</h1>
        <p className="text-sm text-(--text-secondary) mt-1">
          Acompanhe suas notificações, atualizações de projetos e convites em tempo real.
        </p>
      </header>

      <div className="flex justify-center w-full">
        <NotificationList />
      </div>
    </div>
  );
}
