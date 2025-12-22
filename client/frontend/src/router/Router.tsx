import { Route, Switch } from "wouter";
import { routes } from "./routes";
import { ProtectedRoute } from "./PrivateRoutes";

export function Router() {
  return (
    <Switch>
      {routes.map((route, index) => (
        route.protected ? (
          <ProtectedRoute 
            key={index} 
            path={route.path}
            component={route.component} 
          />
        ) : (
          <Route 
            key={index} 
            path={route.path} 
            component={route.component} 
          />
        )
      ))}
    </Switch>
  );
}
