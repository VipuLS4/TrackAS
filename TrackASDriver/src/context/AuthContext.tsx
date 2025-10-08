import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DriverUser, authService } from '../services/AuthService';

interface AuthContextType {
  user: DriverUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDriverStatus: (isOnline: boolean) => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<DriverUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authService.signIn(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDriverStatus = async (isOnline: boolean) => {
    try {
      await authService.updateDriverStatus(isOnline);
      if (user) {
        setUser({ ...user, isOnline });
      }
    } catch (error) {
      console.error('Update driver status error:', error);
      throw error;
    }
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      await authService.updateLocation(latitude, longitude);
      if (user) {
        setUser({ 
          ...user, 
          currentLocation: { latitude, longitude } 
        });
      }
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
    updateDriverStatus,
    updateLocation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
