import { useState, useEffect } from "react";

function ThemeToggle() {
  const [active, setActive] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", active ? "dark" : "light");
    localStorage.setItem("theme", active ? "dark" : "light");
  }, [active]);

  return (
    <label className="swap swap-flip">
      <input type="checkbox" className="theme-controller" checked={active} onChange={(e) => setActive(e.target.checked)} />
      <i className="bi bi-lamp text-xl swap-off"></i>
      <i className="bi bi-lamp-fill text-xl swap-on"></i>
    </label>
  )
}

export default ThemeToggle;
