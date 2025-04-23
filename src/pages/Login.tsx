
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
          <h1 className="text-2xl font-bold">Tibet Carpet Client Portal</h1>
          <p className="text-muted-foreground">Secure Access to Your Carpet Order Tracking</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Client Identifier</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your client code"
                disabled={isSubmitting}
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
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
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
            <p>For demo access:</p>
            <p>Username: <span className="font-medium">demo</span> | Password: <span className="font-medium">demo_pass</span></p>
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

