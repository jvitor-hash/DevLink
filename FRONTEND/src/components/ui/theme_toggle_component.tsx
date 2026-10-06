import { useEffect, useState } from "react";
import { Moon, Sun } from "react-feather";
import "@/assets/global.css";

export function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTheme = () => {
    const nextDark = !dark;

    const updateTheme = () => {
      document.documentElement.classList.toggle("dark", nextDark);
      setDark(nextDark);
    };

    if (
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      document.startViewTransition(updateTheme);
    } else {
      updateTheme();
    }
  };

  const Icon = dark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="hover:cursor-pointer hover:bg-(--surface-3)/95 p-2 transition-colors"
    >
      <Icon size={18} color="var(--primary)" />
    </button>
  );
}
