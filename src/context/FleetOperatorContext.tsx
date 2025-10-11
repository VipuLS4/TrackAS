import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FleetOperatorUser, VehicleDetails, DriverProfile, FleetWallet, FleetAnalytics } from '../types/fleetOperator';
import { FleetOperatorService } from '../services/fleetOperatorService';

interface FleetOperatorContextType {
  fleetOperator: FleetOperatorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  vehicles: VehicleDetails[];
  drivers: DriverProfile[];
  wallet: FleetWallet | null;
  analytics: FleetAnalytics | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshVehicles: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

const FleetOperatorContext = createContext<FleetOperatorContextType | undefined>(undefined);

export const useFleetOperator = () => {
  const context = useContext(FleetOperatorContext);
  if (context === undefined) {
    throw new Error('useFleetOperator must be used within a FleetOperatorProvider');
  }
  return context;
};

interface FleetOperatorProviderProps {
  children: ReactNode;
}

export const FleetOperatorProvider: React.FC<FleetOperatorProviderProps> = ({ children }) => {
  const [fleetOperator, setFleetOperator] = useState<FleetOperatorUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleDetails[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [wallet, setWallet] = useState<FleetWallet | null>(null);
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);

  const isAuthenticated = !!fleetOperator;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const fleetUser = await FleetOperatorService.loginFleetOperator(email, password);
      setFleetOperator(fleetUser);
      localStorage.setItem('trackas_fleet', JSON.stringify(fleetUser));
    } catch (error) {
      console.error('Fleet operator login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const fleetUser = await FleetOperatorService.registerFleetOperator(data);
      setFleetOperator(fleetUser);
      localStorage.setItem('trackas_fleet', JSON.stringify(fleetUser));
    } catch (error) {
      console.error('Fleet operator registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setFleetOperator(null);
    setVehicles([]);
    setDrivers([]);
    setWallet(null);
    setAnalytics(null);
    localStorage.removeItem('trackas_fleet');
    FleetOperatorService.logoutFleetOperator();
  };

  const refreshVehicles = async () => {
    if (!fleetOperator) return;
    
    try {
      const vehicleData = await FleetOperatorService.getVehicles();
      setVehicles(vehicleData);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const refreshDrivers = async () => {
    if (!fleetOperator) return;
    
    try {
      const driverData = await FleetOperatorService.getDrivers();
      setDrivers(driverData);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  const refreshWallet = async () => {
    if (!fleetOperator) return;
    
    try {
      const walletData = await FleetOperatorService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const refreshAnalytics = async () => {
    if (!fleetOperator) return;
    
    try {
      const analyticsData = await FleetOperatorService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    // Check for existing fleet operator session
    const savedFleet = localStorage.getItem('trackas_fleet');
    if (savedFleet) {
      try {
        const fleetUser = JSON.parse(savedFleet);
        setFleetOperator(fleetUser);
      } catch (error) {
        localStorage.removeItem('trackas_fleet');
      }
    }
  }, []);

  useEffect(() => {
    if (fleetOperator) {
      refreshVehicles();
      refreshDrivers();
      refreshWallet();
      refreshAnalytics();
    }
  }, [fleetOperator]);

  const value: FleetOperatorContextType = {
    fleetOperator,
    isAuthenticated,
    isLoading,
    vehicles,
    drivers,
    wallet,
    analytics,
    login,
    register,
    logout,
    refreshVehicles,
    refreshDrivers,
    refreshWallet,
    refreshAnalytics,
  };

  return (
    <FleetOperatorContext.Provider value={value}>
      {children}
    </FleetOperatorContext.Provider>
  );
};
