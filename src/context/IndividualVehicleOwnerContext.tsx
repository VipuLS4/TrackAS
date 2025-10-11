import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IndividualVehicleOwnerUser, IVOTripDetails, IVOWallet, IVOPerformance } from '../types/individualVehicleOwner';
import { IndividualVehicleOwnerService } from '../services/individualVehicleOwnerService';

interface IndividualVehicleOwnerContextType {
  individualOwner: IndividualVehicleOwnerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  availableTrips: IVOTripDetails[];
  activeTrip: IVOTripDetails | null;
  wallet: IVOWallet | null;
  performance: IVOPerformance | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshTrips: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshPerformance: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => Promise<void>;
}

const IndividualVehicleOwnerContext = createContext<IndividualVehicleOwnerContextType | undefined>(undefined);

export const useIndividualVehicleOwner = () => {
  const context = useContext(IndividualVehicleOwnerContext);
  if (context === undefined) {
    throw new Error('useIndividualVehicleOwner must be used within an IndividualVehicleOwnerProvider');
  }
  return context;
};

interface IndividualVehicleOwnerProviderProps {
  children: ReactNode;
}

export const IndividualVehicleOwnerProvider: React.FC<IndividualVehicleOwnerProviderProps> = ({ children }) => {
  const [individualOwner, setIndividualOwner] = useState<IndividualVehicleOwnerUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTrips, setAvailableTrips] = useState<IVOTripDetails[]>([]);
  const [activeTrip, setActiveTrip] = useState<IVOTripDetails | null>(null);
  const [wallet, setWallet] = useState<IVOWallet | null>(null);
  const [performance, setPerformance] = useState<IVOPerformance | null>(null);

  const isAuthenticated = !!individualOwner;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const ivoUser = await IndividualVehicleOwnerService.loginIVO(email, password);
      setIndividualOwner(ivoUser);
      localStorage.setItem('trackas_ivo', JSON.stringify(ivoUser));
    } catch (error) {
      console.error('Individual vehicle owner login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const ivoUser = await IndividualVehicleOwnerService.registerIVO(data);
      setIndividualOwner(ivoUser);
      localStorage.setItem('trackas_ivo', JSON.stringify(ivoUser));
    } catch (error) {
      console.error('Individual vehicle owner registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIndividualOwner(null);
    setAvailableTrips([]);
    setActiveTrip(null);
    setWallet(null);
    setPerformance(null);
    localStorage.removeItem('trackas_ivo');
    IndividualVehicleOwnerService.logoutIVO();
  };

  const refreshTrips = async () => {
    if (!individualOwner) return;
    
    try {
      const [trips, active] = await Promise.all([
        IndividualVehicleOwnerService.getAvailableTrips(),
        IndividualVehicleOwnerService.getActiveTrip(),
      ]);
      setAvailableTrips(trips);
      setActiveTrip(active);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  };

  const refreshWallet = async () => {
    if (!individualOwner) return;
    
    try {
      const walletData = await IndividualVehicleOwnerService.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const refreshPerformance = async () => {
    if (!individualOwner) return;
    
    try {
      const performanceData = await IndividualVehicleOwnerService.getPerformance();
      setPerformance(performanceData);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!individualOwner) return;
    
    try {
      await IndividualVehicleOwnerService.updateLocation(lat, lng);
      setIndividualOwner(prev => prev ? { ...prev, currentLocation: { lat, lng } } : null);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const setOnlineStatus = async (isOnline: boolean) => {
    if (!individualOwner) return;
    
    try {
      await IndividualVehicleOwnerService.setOnlineStatus(isOnline);
      setIndividualOwner(prev => prev ? { ...prev, isOnline } : null);
    } catch (error) {
      console.error('Failed to update online status:', error);
    }
  };

  useEffect(() => {
    // Check for existing individual vehicle owner session
    const savedIVO = localStorage.getItem('trackas_ivo');
    if (savedIVO) {
      try {
        const ivoUser = JSON.parse(savedIVO);
        setIndividualOwner(ivoUser);
      } catch (error) {
        localStorage.removeItem('trackas_ivo');
      }
    }
  }, []);

  useEffect(() => {
    if (individualOwner) {
      refreshTrips();
      refreshWallet();
      refreshPerformance();
    }
  }, [individualOwner]);

  const value: IndividualVehicleOwnerContextType = {
    individualOwner,
    isAuthenticated,
    isLoading,
    availableTrips,
    activeTrip,
    wallet,
    performance,
    login,
    register,
    logout,
    refreshTrips,
    refreshWallet,
    refreshPerformance,
    updateLocation,
    setOnlineStatus,
  };

  return (
    <IndividualVehicleOwnerContext.Provider value={value}>
      {children}
    </IndividualVehicleOwnerContext.Provider>
  );
};
