import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button className="icon-btn" onClick={toggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
