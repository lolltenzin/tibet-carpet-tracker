
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { validateCredentials } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  session: Session | null;
  requestPasswordReset: (username: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
          // Update our custom user object from the Supabase user
          const userData: User = {
            id: currentSession.user.id,
            username: currentSession.user.email || '',
            clientCode: currentSession.user.user_metadata?.clientCode || 'WS',
            clientName: currentSession.user.user_metadata?.clientName || 'Default Client',
            role: currentSession.user.user_metadata?.role || 'client'
          };
          
          setUser(userData);
          localStorage.setItem('tibet_carpet_user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('tibet_carpet_user');
        }
      }
    );

    // Check for existing session
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkExistingSession = async () => {
    try {
      // Check if user is already logged in from Supabase session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        setSession(existingSession);
        
        // Create our custom user from Supabase session
        const userData: User = {
          id: existingSession.user.id,
          username: existingSession.user.email || '',
          clientCode: existingSession.user.user_metadata?.clientCode || 'WS',
          clientName: existingSession.user.user_metadata?.clientName || 'Default Client',
          role: existingSession.user.user_metadata?.role || 'client'
        };
        
        setUser(userData);
        localStorage.setItem('tibet_carpet_user', JSON.stringify(userData));
      } else {
        // Fall back to localStorage if no Supabase session
        const storedUser = localStorage.getItem('tibet_carpet_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
            localStorage.removeItem('tibet_carpet_user');
          }
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
      // First check with our mock validation 
      const authenticatedUser = validateCredentials(username, password);
      
      if (authenticatedUser) {
        // Now sign in with Supabase using email/password
        // For demo purposes, we'll create a fake email using the username
        const email = `${username.toLowerCase()}@example.com`;
        
        // Try to sign in with Supabase
        let supabaseResult;
        
        try {
          supabaseResult = await supabase.auth.signInWithPassword({
            email,
            password
          });
        } catch (error) {
          console.log("Supabase signin failed, creating user:", error);
          
          // If sign in fails (likely because user doesn't exist yet in Supabase), 
          // create the user for development purposes
          supabaseResult = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                clientCode: authenticatedUser.clientCode,
                clientName: authenticatedUser.clientName,
                role: authenticatedUser.role
              }
            }
          });
        }
        
        if (supabaseResult.error) {
          console.error("Supabase auth error:", supabaseResult.error);
          toast({
            title: "Login failed",
            description: supabaseResult.error.message || "Authentication failed with Supabase",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // If we have a session, set user state
        if (supabaseResult.data.session) {
          setSession(supabaseResult.data.session);
          
          // Update user metadata if needed
          await supabase.auth.updateUser({
            data: {
              clientCode: authenticatedUser.clientCode,
              clientName: authenticatedUser.clientName, 
              role: authenticatedUser.role
            }
          });
          
          // Set our custom user object
          setUser(authenticatedUser);
          localStorage.setItem('tibet_carpet_user', JSON.stringify(authenticatedUser));
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${authenticatedUser.clientName}`,
          });
          
          setIsLoading(false);
          return true;
        }
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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
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

  // Password reset functionality
  const requestPasswordReset = async (username: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For development purposes, create a fake email from username
      const email = `${username.toLowerCase()}@example.com`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Password reset request error:", error);
        toast({
          title: "Password reset email failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      toast({
        title: "Password reset email sent",
        description: "If an account exists with this username, you will receive a password reset link",
      });
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Password reset request error:", error);
      
      // Don't reveal if the username exists or not for security
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message || "Invalid or expired token. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
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
      session,
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
