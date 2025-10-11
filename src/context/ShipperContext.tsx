import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShipperUser, ShipmentDetails, ShipperWallet, ShipperAnalytics } from '../types/shipper';
import { ShipperService } from '../services/shipperService';

interface ShipperContextType {
  shipper: ShipperUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  shipments: ShipmentDetails[];
  wallet: ShipperWallet | null;
  analytics: ShipperAnalytics | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshShipments: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

const ShipperContext = createContext<ShipperContextType | undefined>(undefined);

export const useShipper = () => {
  const context = useContext(ShipperContext);
  if (context === undefined) {
    throw new Error('useShipper must be used within a ShipperProvider');
  }
  return context;
};

interface ShipperProviderProps {
  children: ReactNode;
}

export const ShipperProvider: React.FC<ShipperProviderProps> = ({ children }) => {
  const [shipper, setShipper] = useState<ShipperUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [wallet, setWallet] = useState<ShipperWallet | null>(null);
  const [analytics, setAnalytics] = useState<ShipperAnalytics | null>(null);

  const isAuthenticated = !!shipper;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const shipperUser = await ShipperService.loginShipper(email, password);
      setShipper(shipperUser);
      localStorage.setItem('trackas_shipper', JSON.stringify(shipperUser));
    } catch (error) {
      console.error('Shipper login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const shipperUser = await ShipperService.registerShipper(data);
      setShipper(shipperUser);
      localStorage.setItem('trackas_shipper', JSON.stringify(shipperUser));
    } catch (error) {
      console.error('Shipper registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setShipper(null);
    setShipments([]);
    setWallet(null);
    setAnalytics(null);
    localStorage.removeItem('trackas_shipper');
    ShipperService.logoutShipper();
  };

  const refreshShipments = async () => {
    if (!shipper) return;
    
    try {
      const shipmentData = await ShipperService.getShipments();
      setShipments(shipmentData);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    }
  };

  const refreshWallet = async () => {
    if (!shipper) return;
    
    try {
      const walletData = await ShipperService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const refreshAnalytics = async () => {
    if (!shipper) return;
    
    try {
      const analyticsData = await ShipperService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    // Check for existing shipper session
    const savedShipper = localStorage.getItem('trackas_shipper');
    if (savedShipper) {
      try {
        const shipperUser = JSON.parse(savedShipper);
        setShipper(shipperUser);
      } catch (error) {
        localStorage.removeItem('trackas_shipper');
      }
    }
  }, []);

  useEffect(() => {
    if (shipper) {
      refreshShipments();
      refreshWallet();
      refreshAnalytics();
    }
  }, [shipper]);

  const value: ShipperContextType = {
    shipper,
    isAuthenticated,
    isLoading,
    shipments,
    wallet,
    analytics,
    login,
    register,
    logout,
    refreshShipments,
    refreshWallet,
    refreshAnalytics,
  };

  return (
    <ShipperContext.Provider value={value}>
      {children}
    </ShipperContext.Provider>
  );
};
