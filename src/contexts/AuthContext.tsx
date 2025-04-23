
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { validateCredentials } from '@/lib/data';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
