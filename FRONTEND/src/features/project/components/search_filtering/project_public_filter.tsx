import { ULIB } from "@/shared/ui";

const AUDIENCES = [
  { value: "CLIENTS", label: "Clientes" },
  { value: "INTERNAL_TOOL", label: "Ferramenta interna" },
  { value: "BUSINESSES", label: "Negócios" },
  { value: "STUDENTS", label: "Estudantes" },
  { value: "ADMINISTRATORS", label: "Administradores" },
  { value: "RESEARCHER", label: "Pesquisadores" },
];

export default function SearchProjectPublicFilter({ value = "", onSelect }) {
  return (
    <ULIB.select value={value} onChange={(e: any) => onSelect(e.target.value)} aria-label="Filtrar por Público-alvo">
      <option value="">Todos os Públicos</option>
      {AUDIENCES.map((a) => (
        <ULIB.selectOption key={a.value} value={a.value}>
          {a.label}
        </ULIB.selectOption>
      ))}
    </ULIB.select>
  );
}
