import { useState } from "react";
import { ULIB } from "@/shared/ui";

interface SearchProjectBudgetFilterProps {
  minBudget?: number | string;
  maxBudget?: number | string;
  onChange: (min?: number, max?: number) => void;
}

export default function SearchProjectBudgetFilter({
  minBudget,
  maxBudget,
  onChange,
}: SearchProjectBudgetFilterProps) {
  const [min, setMin] = useState<string>(minBudget ? String(minBudget) : "");
  const [max, setMax] = useState<string>(maxBudget ? String(maxBudget) : "");

  const handleMinChange = (val: string) => {
    setMin(val);
    const parsedMin = val ? Number(val) : undefined;
    const parsedMax = max ? Number(max) : undefined;
    onChange(parsedMin, parsedMax);
  };

  const handleMaxChange = (val: string) => {
    setMax(val);
    const parsedMin = min ? Number(min) : undefined;
    const parsedMax = val ? Number(val) : undefined;
    onChange(parsedMin, parsedMax);
  };

  return (
    <div className="flex items-center gap-2">
      <ULIB.input
        type="number"
        placeholder="Min R$"
        value={min}
        onChange={(e: any) => handleMinChange(e.target.value)}
        className="w-1/2"
        aria-label="Orçamento Mínimo"
      />
      <span className="text-(--text-muted)">-</span>
      <ULIB.input
        type="number"
        placeholder="Max R$"
        value={max}
        onChange={(e: any) => handleMaxChange(e.target.value)}
        className="w-1/2"
        aria-label="Orçamento Máximo"
      />
    </div>
  );
}
