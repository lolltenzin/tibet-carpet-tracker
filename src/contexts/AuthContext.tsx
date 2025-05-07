
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { validateCredentials } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  requestPasswordReset: (username: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check for existing Supabase session on mount
  useEffect(() => {
    const checkSupabaseSession = async () => {
      // Check the current session status
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking Supabase session:", error);
      } else if (data.session) {
        console.log("Current Supabase session:", data);
        
        // If we have a session but no user in state, attempt to restore user from metadata
        if (!user && data.session.user.user_metadata.clientCode) {
          const clientCode = data.session.user.user_metadata.clientCode;
          const role = data.session.user.user_metadata.role;
          const restoredUser = {
            id: data.session.user.id,
            username: data.session.user.email || clientCode,
            clientCode: clientCode,
            clientName: clientCode, // Would be better to fetch from somewhere
            role: role || 'client'
          };
          
          setUser(restoredUser);
          localStorage.setItem('tibet_carpet_user', JSON.stringify(restoredUser));
        }
      }
    };
    
    checkSupabaseSession();
  }, [user]);
  
  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('tibet_carpet_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // After retrieving the user from localStorage, also sign in with Supabase
        signInWithSupabase(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('tibet_carpet_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to sign in with Supabase
  const signInWithSupabase = async (user: User) => {
    try {
      console.log("Attempting to sign in with Supabase for user:", user.username);
      
      // Use email/password sign-in with a fixed pattern
      // This is a temporary solution - in a real app, this would use proper credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${user.username.toLowerCase()}@tibetcarpet.test`,
        password: 'Carpet123!' // Use a standard password for all test accounts
      });
      
      if (error) {
        console.error("Failed to sign in with Supabase:", error);
        
        // If login fails, try to create the user first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${user.username.toLowerCase()}@tibetcarpet.test`,
          password: 'Carpet123!',
          options: {
            data: { 
              clientCode: user.clientCode,
              role: user.role
            }
          }
        });
        
        if (signUpError) {
          console.error("Failed to sign up with Supabase:", signUpError);
        } else {
          console.log("Successfully signed up with Supabase:", signUpData);
        }
      } else {
        console.log("Successfully signed in with Supabase:", data);
        
        // Update user metadata if needed
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            clientCode: user.clientCode,
            role: user.role
          }
        });
        
        if (updateError) {
          console.error("Failed to update user metadata:", updateError);
        }
      }
    } catch (error) {
      console.error("Error during Supabase sign in:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        const authenticatedUser = validateCredentials(username, password);
        
        if (authenticatedUser) {
          setUser(authenticatedUser);
          localStorage.setItem('tibet_carpet_user', JSON.stringify(authenticatedUser));
          
          // Also sign in with Supabase for RLS
          signInWithSupabase(authenticatedUser);
          
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
    
    // Also sign out from Supabase
    supabase.auth.signOut();
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Check if current user has admin role
  const isAdmin = () => {
    return user?.role === 'admin';
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
    <AuthContext.Provider value={{ user, login, logout, isLoading, requestPasswordReset, resetPassword, isAdmin }}>
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
