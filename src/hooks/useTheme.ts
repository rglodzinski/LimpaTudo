import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Backed by ~/.config/limpatudo/settings.json (see electron/settings.ts). */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window.limpaTudo.getSettings().then((settings) => {
      setTheme(settings.theme);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      window.limpaTudo.updateSettings({ theme: next });
      return next;
    });
  }

  return { theme, toggleTheme, loaded };
}
