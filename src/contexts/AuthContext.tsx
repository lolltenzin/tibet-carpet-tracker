
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
    // Check if user is logged in from localStorage
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
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        const authenticatedUser = validateCredentials(username, password);
        
        if (authenticatedUser) {
          setUser(authenticatedUser);
          localStorage.setItem('tibet_carpet_user', JSON.stringify(authenticatedUser));
          toast({
            title: "Login successful",
            description: `Welcome back, ${authenticatedUser.clientName}`,
          });
          resolve(true);
        } else {
          toast({
            title: "Login failed",
            description: "Invalid username or password",
            variant: "destructive",
          });
          resolve(false);
        }
        
        setIsLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tibet_carpet_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Password reset functionality
  const requestPasswordReset = async (username: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network request for password reset
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if the username exists
        const userExists = ["client1", "client2", "WS", "RM", "ADV", "HR", "NB", "TC", "LC"].includes(username);
        
        if (userExists) {
          toast({
            title: "Password reset email sent",
            description: "If an account exists with this username, you will receive a password reset link",
          });
          resolve(true);
        } else {
          // Don't reveal if the username exists or not for security reasons
          toast({
            title: "Password reset email sent",
            description: "If an account exists with this username, you will receive a password reset link",
          });
          resolve(false);
        }
        
        setIsLoading(false);
      }, 1000);
    });
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network request for password reset confirmation
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real application, we would verify the token
        // and update the password in the database
        if (token && newPassword.length >= 6) {
          toast({
            title: "Password reset successful",
            description: "Your password has been updated. You can now log in with your new password.",
          });
          resolve(true);
        } else {
          toast({
            title: "Password reset failed",
            description: "Invalid or expired token. Please try again.",
            variant: "destructive",
          });
          resolve(false);
        }
        
        setIsLoading(false);
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, requestPasswordReset, resetPassword }}>
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
