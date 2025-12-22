import { Route, Redirect } from "wouter";
import { useAuth } from "@/global/hooks/useAuth";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isLogged } = useAuth();

  if (!isLogged) {
    return <Redirect to="/login" />;
  }

  return <Route path={path} component={Component} />;
}