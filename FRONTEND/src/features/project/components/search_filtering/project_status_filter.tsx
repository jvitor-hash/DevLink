import { ULIB } from "@/shared/ui";

const STATUSES = [
  { value: "OPEN", label: "Aberto" },
  { value: "NEGOTIATING", label: "Em negociação" },
  { value: "IN_DEVELOPMENT", label: "Em desenvolvimento" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function SearchProjectStatusFilter({ value = "", onSelect }) {
  return (
    <ULIB.select value={value} onChange={(e: any) => onSelect(e.target.value)} aria-label="Filtrar por Status">
      <option value="">Todos os Status</option>
      {STATUSES.map((s) => (
        <ULIB.selectOption key={s.value} value={s.value}>
          {s.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
