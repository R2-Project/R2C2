export type AuthenticationContextType = {
    isLogged: boolean;
    setIsLogged: (logged: boolean) => void;
    authenticate: () => void;
}