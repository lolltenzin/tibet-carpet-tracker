
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, User } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-tibet-cream/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <div className="mx-auto h-12 w-12 bg-tibet-red rounded-md flex items-center justify-center">
              <span className="font-bold text-white text-xl">TC</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Tibet Carpet</h1>
          <p className="text-muted-foreground">Secure Order Management</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Client Identifier
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your client code"
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-tibet-red hover:bg-tibet-red/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Access Order Portal"}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Available logins:</p>
            <p>WS / PASSWORD</p>
            <p>client1 / password</p>
            <p>client2 / password</p>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need assistance? Contact your Tibet Carpet representative.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
