import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/global/hooks/use-toast";
import R2C2Logo from "@/assets/images/r2c2-1.jpeg";
import { useAuth } from "@/global/hooks/useAuth";
import { Login as AppLogin } from '../../wailsjs/go/main/App';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setIsLogged, authenticate } = useAuth();

  const handleDevLogin = () => {
    authenticate();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      await AppLogin(serverUrl, username, password);

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      onLogin();
      setLocation("/");

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-[0_0_15px_rgba(189,147,249,0.5)] mb-2">
            <img src={R2C2Logo} alt="R2C2 Logo" className="w-full h-full object-cover" />
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverUrl">Server URL / IP</Label>
              <Input
                id="serverUrl"
                placeholder="https://c2.example.com or 127.0.0.1:8080"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-primary"
              onClick={handleDevLogin}
              type="button"
            >
              Developer Mode (Bypass Login)
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
