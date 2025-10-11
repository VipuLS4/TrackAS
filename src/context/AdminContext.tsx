import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, AdminDashboardData } from '../types/admin';
import { AdminService } from '../services/adminService';

interface AdminContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dashboardData: AdminDashboardData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshDashboardData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

  const isAuthenticated = !!admin;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const adminUser = await AdminService.loginAdmin(email, password);
      setAdmin(adminUser);
      localStorage.setItem('trackas_admin', JSON.stringify(adminUser));
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setDashboardData(null);
    localStorage.removeItem('trackas_admin');
    AdminService.logoutAdmin();
  };

  const refreshDashboardData = async () => {
    if (!admin) return;
    
    try {
      const data = await AdminService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    // Check for existing admin session
    const savedAdmin = localStorage.getItem('trackas_admin');
    if (savedAdmin) {
      try {
        const adminUser = JSON.parse(savedAdmin);
        setAdmin(adminUser);
      } catch (error) {
        localStorage.removeItem('trackas_admin');
      }
    }
  }, []);

  useEffect(() => {
    if (admin) {
      refreshDashboardData();
    }
  }, [admin]);

  const value: AdminContextType = {
    admin,
    isAuthenticated,
    isLoading,
    dashboardData,
    login,
    logout,
    refreshDashboardData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
