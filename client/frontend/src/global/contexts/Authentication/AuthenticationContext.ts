import { createContext } from "react";
import { AuthenticationContextType } from "./AuthenticationContextType";

export const AuthenticationContext = createContext<AuthenticationContextType | null>(null);