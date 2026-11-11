import { useState } from "react";
import { Input, InputAdornment, InputGroup } from "./input_component";

const format = (value: string) => value ? Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
export function MoneyInput({ value, onChange, maxLength, ...props }: { value?: string; onChange?: (value: string) => void; maxLength?: number; placeholder?: string; name?: string; id?: string; error?: boolean }) {
  const [internal, setInternal] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  const current = value ?? internal;
  return <InputGroup><InputAdornment>R$</InputAdornment><Input {...props} className="pl-10" inputMode="numeric" value={focused ? current : format(current)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={(event) => { const next = event.target.value.replace(/\D/g, "").slice(0, maxLength); if (value === undefined) setInternal(next); onChange?.(next); }} /></InputGroup>;
}
