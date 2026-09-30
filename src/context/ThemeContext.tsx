import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { readRawStorage } from "../lib/storage";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
const KEY = "upb_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    readRawStorage(KEY) === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.dataset.theme = "dark";
    else delete root.dataset.theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#17171a" : "#ffffff");
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      // not persisted
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
