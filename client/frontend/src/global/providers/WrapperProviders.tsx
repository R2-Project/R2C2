import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthenticationProvider } from "./Authentication/AuthenticationProvider";
import { ThemeProvider } from "./Theme/ThemeProvider";
import { queryClient } from "../libs/queryClient/queryClient";
import { WebSocketProvider } from "@/lib/websocket-context";

export const WrapperProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <AuthenticationProvider>
        <ThemeProvider defaultTheme="dracula" storageKey="vite-ui-theme">
          <WebSocketProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>{children}</TooltipProvider>
            </QueryClientProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </AuthenticationProvider>
    </>
  );
};
