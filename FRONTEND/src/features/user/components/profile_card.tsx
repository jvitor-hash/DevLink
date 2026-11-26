import { ULIB } from "@/shared/ui";
import { UserBadge } from "./user_badge";

export function ProfileCard({ user, actions }) {
  return (
    <ULIB.card className="p-6 flex flex-col gap-4 border border-(--border)">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-(--primary)/20 flex items-center justify-center font-bold text-lg text-(--primary)">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <UserBadge role={user.role} />
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {user.bio ? (
        <p className="text-(--text-secondary) text-sm">{user.bio}</p>
      ) : (
        <p className="text-(--text-muted) text-sm italic">Nenhuma biografia informada.</p>
      )}
    </ULIB.card>
  );
}
