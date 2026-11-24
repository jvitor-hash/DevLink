import { ULIB } from "@/shared/ui";

export function UserBadge(role) {
  if (!role) return null;

  const isProgrammer = role.toUpperCase() === "PROGRAMMER";
  const label = isProgrammer ? "Programador" : role.toUpperCase() === "ADMIN" ? "Admin" : "Cliente";

  return (
    <ULIB.badge tone={isProgrammer ? "brand" : "default"}>{label}</ULIB.badge>
  );
}
