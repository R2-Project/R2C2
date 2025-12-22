import { createContext } from "react";
import { ThemeContextType } from "./ThemeContextType";

export const ThemeContext = createContext<ThemeContextType | null>(null);
