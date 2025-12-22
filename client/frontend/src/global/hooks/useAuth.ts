import { useContext } from "react";
import { AuthenticationContext } from "@/global/contexts/Authentication/AuthenticationContext";

export const useAuth = () => {
  const context = useContext(AuthenticationContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthenticationProvider");
  }

  return context;
};
