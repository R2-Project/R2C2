import { AuthenticationContext } from "@/global/contexts/Authentication/AuthenticationContext";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Reconnect } from "../../../../wailsjs/go/main/App";

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token");
            const serverUrl = localStorage.getItem("serverUrl");

            if (token) {
                if (serverUrl && (window as any)['go']?.main?.App?.Reconnect) {
                    try {
                        await Reconnect(serverUrl, token);
                    } catch (e) {
                        console.error("Failed to reconnect websocket:", e);
                    }
                }
                setIsLogged(true);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
                Loading...
            </div>
        );
    }

    const authenticate = () => {
        setIsLogged(true);
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("userInfo", "{\"username\":\"dummy\"}");
        setLocation("/");
    }

    return (
        <AuthenticationContext.Provider value={{ isLogged, setIsLogged, authenticate }}>
            {children}
        </AuthenticationContext.Provider>
    );
}