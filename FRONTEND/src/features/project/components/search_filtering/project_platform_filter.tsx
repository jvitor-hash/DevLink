import { ULIB } from "@/shared/ui";

const PLATFORMS = [
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "DESKTOP", label: "Desktop" },
];

export default function SearchProjectPlatformFilter({ value = "", onSelect }) {
  return (
    <ULIB.select value={value} onChange={(e: any) => onSelect(e.target.value)} aria-label="Filtrar por Plataforma">
      <option value="">Todas as Plataformas</option>
      {PLATFORMS.map((p) => (
        <ULIB.selectOption key={p.value} value={p.value}>
          {p.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
