import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerTrackingData, CustomerFeedback } from '../types/customer';
import { CustomerService } from '../services/customerService';

interface CustomerContextType {
  trackingData: CustomerTrackingData | null;
  isLoading: boolean;
  error: string | null;
  getTrackingData: (token: string) => Promise<void>;
  submitFeedback: (feedback: CustomerFeedback) => Promise<void>;
  reportIssue: (shipmentId: string, issueData: any) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
  const [trackingData, setTrackingData] = useState<CustomerTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTrackingData = async (token: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await CustomerService.getTrackingData(token);
      
      // Check if it's an error response
      if ('code' in data) {
        setError(data.message);
        setTrackingData(null);
      } else {
        setTrackingData(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking data');
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (feedback: CustomerFeedback) => {
    try {
      await CustomerService.submitFeedback(feedback);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  };

  const reportIssue = async (shipmentId: string, issueData: any) => {
    try {
      await CustomerService.reportIssue(shipmentId, issueData);
    } catch (err) {
      console.error('Failed to report issue:', err);
      throw err;
    }
  };

  const value: CustomerContextType = {
    trackingData,
    isLoading,
    error,
    getTrackingData,
    submitFeedback,
    reportIssue,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
