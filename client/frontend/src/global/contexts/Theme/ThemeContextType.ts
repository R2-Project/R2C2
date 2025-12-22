export type Theme = "dracula" | "light" | "dark";

export type ThemeContextType = {
  theme: Theme;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
};
