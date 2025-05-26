import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  
  // Password reset states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { requestPasswordReset } = useAuth();
  
  // Check if we're in password reset mode
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(!!resetToken);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetRequest = async () => {
    if (!resetEmail) return;
    
    setIsResetting(true);
    try {
      await requestPasswordReset(resetEmail);
      setResetDialogOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || newPassword !== confirmPassword || newPassword.length < 6) return;
    
    setIsSubmitting(true);
    try {
      const success = await resetPassword(resetToken, newPassword);
      if (success) {
        setResetPasswordMode(false);
      }
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
          {resetPasswordMode ? (
            // Password Reset Form
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-center">Reset Your Password</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Enter your new password below
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter your new password"
                    disabled={isSubmitting}
                    className="pl-10"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your new password"
                    disabled={isSubmitting}
                    className="pl-10"
                    minLength={6}
                  />
                </div>
                {newPassword !== confirmPassword && newPassword && confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-tibet-red hover:bg-tibet-red/90" 
                disabled={isSubmitting || newPassword !== confirmPassword || newPassword.length < 6}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => setResetPasswordMode(false)} disabled={isSubmitting}>
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            // Regular Login Form
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

              <div className="text-right">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm text-muted-foreground hover:text-tibet-red"
                  onClick={(e) => {
                    e.preventDefault();
                    setResetDialogOpen(true);
                  }}
                >
                  Forgot password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-tibet-red hover:bg-tibet-red/90" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Authenticating..." : "Access Order Portal"}
              </Button>
            </form>
          )}
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Use any client code from your database with password: <strong>password</strong><br />
              Or admin login: Username: <strong>admin</strong>, Password: <strong>admin123</strong>
            </p>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need assistance? Contact your Tibet Carpet representative.
          </p>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your client identifier below. If an account exists, we'll send you a password reset link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter your client identifier"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={isResetting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={!resetEmail || isResetting}
              onClick={(e) => {
                e.preventDefault();
                handleResetRequest();
              }}
            >
              {isResetting ? "Sending..." : "Send reset link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Login;
