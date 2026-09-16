import Badge from "../ui/badge_component";
import Button from "../ui/button_component";

type ProfileCardProps = {
  name: string
  role: string
  bio?: string | null
  connections?: number
  onClick?: () => void
};

export default function ProfileCard({
  name,
  role,
  bio,
  connections,
  onClick,
}: ProfileCardProps) {
  return (
    <section
      onClick={onClick}
      className={`w-full max-w-100 overflow-hidden rounded-md bg-(--surface-1) border border-(--border-subtle) ${onClick ? "hover:cursor-pointer hover:border-(--primary) transition-colors" : ""}`}
    >
      <div className="bg-amber-300 w-full h-full max-h-10">.</div>

      {/* Content */}
      <div className="relative px-6 pb-6 pt-6">
        {/* Avatar */}
        <div className="w-25 h-25 rounded-full bg-(--surface-2) border border-(--border-subtle) flex items-center justify-center text-2xl font-bold text-(--text-muted)">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="mt-4">
          <div className="flex gap-4">
            <h2 className="text-xl ">{name}</h2>
            <Badge
              label={role === "CLIENT" ? "Cliente" : role === "PROGRAMMER" ? "Programador" : "Admin"}
              badgeType={role === "PROGRAMMER" ? "info" : role === "CLIENT" ? "success" : "primary"}
            />
          </div>

          {bio ? (
            <p>{bio}</p>
          ) : (
            <p className="text-sm italic text-(--text-muted)">Bio placeholder</p>
          )}

          {connections !== undefined && (
            <p className="mt-2 text-base text-(--primary)">
              {connections.toLocaleString()} projetos publicados
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Button label="Seguir" buttonType="button"/>

          <Button label="Conversar" colorType="secondary" buttonType="button"/>
        </div>
      </div>
    </section>
  );
}
