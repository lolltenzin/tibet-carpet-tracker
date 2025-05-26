
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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
      console.log("Attempting login with username:", username);
      
      // Check if user exists in the CarpetOrder table to get valid client codes
      const { data: orders, error: ordersError } = await supabase
        .from('CarpetOrder')
        .select('Buyercode')
        .limit(1000);
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      }
      
      // Get unique buyer codes from the database
      const validClientCodes = orders ? [...new Set(orders.map(order => order.Buyercode).filter(Boolean))] : [];
      console.log("Valid client codes from database:", validClientCodes);
      
      // Check if the username matches any client code in the database
      const isValidClient = validClientCodes.some(code => 
        code && code.toString().toLowerCase() === username.toLowerCase()
      );
      
      // Admin check
      const isAdmin = username.toLowerCase() === 'admin' && password === 'admin123';
      
      // Simple password validation for clients (you can enhance this)
      const isValidPassword = password === 'password' || password === 'PASSWORD' || isAdmin;
      
      if ((isValidClient && isValidPassword) || isAdmin) {
        const authenticatedUser: User = {
          id: isAdmin ? 'admin1' : `user_${username}`,
          username: username,
          clientCode: isAdmin ? 'TC' : username as any,
          clientName: isAdmin ? 'System Administrator' : `${username} Client`,
          role: isAdmin ? 'admin' : 'client'
        };
        
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
          description: "Invalid username or password. Please use a valid client code from your database.",
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
