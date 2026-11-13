import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";
export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setDark((value) => !value)}
      className="cursor-pointer rounded p-2 hover:bg-(--surface-3)"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
