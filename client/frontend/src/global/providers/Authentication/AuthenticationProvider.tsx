import { AuthenticationContext } from "@/global/contexts/Authentication/AuthenticationContext";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [, setLocation] = useLocation();

    useEffect(() => {
        // Verificar si hay token al cargar
        const token = localStorage.getItem("token");
        setIsLogged(!!token);
        setIsLoading(false);
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