import { ThemeContext } from "@/global/contexts/Theme/ThemeContext";
import { Theme } from "@/global/contexts/Theme/ThemeContextType";
import { useState, useEffect } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const AVAILABLE_THEMES: Theme[] = ["dracula", "light", "dark"];

export const ThemeProvider = ({
  children,
  defaultTheme = "dracula",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remover todos los temas
    AVAILABLE_THEMES.forEach((t) => root.classList.remove(t));
    
    // Agregar el tema actual
    root.classList.add(theme);
    
    // Asegurar que dracula siempre tenga dark mode
    if (theme === "dracula") {
      root.classList.add("dark");
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: AVAILABLE_THEMES,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
