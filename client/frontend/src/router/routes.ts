import C2Dashboard from "@/pages/C2Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

interface Route {
    path: string;
    component: React.ComponentType<any>;
    protected?: boolean;
}

export const routes: Route[] = [
    {

        path: "/",
        component: C2Dashboard,
        protected: true,
    },
    {
        path: "/login",
        component: Login,
    },
    {
        path: "*",
        component: NotFound,    
    }
]