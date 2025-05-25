
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { validateCredentials } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  requestPasswordReset: (username: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check for existing user in localStorage
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedUser = localStorage.getItem('tibet_carpet_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('tibet_carpet_user');
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Use our mock validation system
      const authenticatedUser = validateCredentials(username, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('tibet_carpet_user', JSON.stringify(authenticatedUser));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${authenticatedUser.clientName}`,
        });
        
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('tibet_carpet_user');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mock password reset functionality
  const requestPasswordReset = async (username: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, just simulate success
      toast({
        title: "Password reset email sent",
        description: "If an account exists with this username, you will receive a password reset link",
      });
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Password reset request error:", error);
      
      toast({
        title: "Password reset email sent",
        description: "If an account exists with this username, you will receive a password reset link",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo purposes, just simulate success
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      requestPasswordReset, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
