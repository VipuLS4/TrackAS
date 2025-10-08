import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OfflineJob, PendingAction, offlineService } from '../services/OfflineService';

interface OfflineContextType {
  jobs: OfflineJob[];
  pendingActions: PendingAction[];
  isOnline: boolean;
  isLoading: boolean;
  lastSyncTime: string | null;
  refreshJobs: () => Promise<void>;
  acceptJob: (jobId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: OfflineJob['status']) => Promise<void>;
  downloadOfflineData: () => Promise<void>;
  syncPendingData: () => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheSize: () => Promise<number>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [jobs, setJobs] = useState<OfflineJob[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    initializeOffline();
  }, []);

  const initializeOffline = async () => {
    try {
      setIsLoading(true);
      
      // Check network status
      const online = offlineService.isOnline();
      setIsOnline(online);
      
      // Load jobs
      await refreshJobs();
      
      // Load pending actions
      await refreshPendingActions();
      
      // Get last sync time
      const syncTime = await offlineService.getLastSyncTime();
      setLastSyncTime(syncTime);
      
    } catch (error) {
      console.error('Offline initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshJobs = async () => {
    try {
      const jobsData = await offlineService.getJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  const refreshPendingActions = async () => {
    try {
      const actions = await offlineService.getPendingActions();
      setPendingActions(actions);
    } catch (error) {
      console.error('Error refreshing pending actions:', error);
    }
  };

  const acceptJob = async (jobId: string) => {
    try {
      setIsLoading(true);
      
      // Update job status
      await offlineService.updateJobStatus(jobId, 'accepted');
      
      // Refresh jobs list
      await refreshJobs();
      
      // If offline, this will be added to pending actions automatically
      if (!isOnline) {
        await refreshPendingActions();
      }
      
    } catch (error) {
      console.error('Error accepting job:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: OfflineJob['status']) => {
    try {
      setIsLoading(true);
      
      // Update job status
      await offlineService.updateJobStatus(jobId, status);
      
      // Refresh jobs list
      await refreshJobs();
      
      // If offline, this will be added to pending actions automatically
      if (!isOnline) {
        await refreshPendingActions();
      }
      
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadOfflineData = async () => {
    try {
      setIsLoading(true);
      
      if (!isOnline) {
        throw new Error('Cannot download data while offline');
      }
      
      await offlineService.downloadOfflineData();
      await refreshJobs();
      
      const syncTime = await offlineService.getLastSyncTime();
      setLastSyncTime(syncTime);
      
    } catch (error) {
      console.error('Error downloading offline data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncPendingData = async () => {
    try {
      setIsLoading(true);
      
      if (!isOnline) {
        throw new Error('Cannot sync while offline');
      }
      
      await offlineService.syncPendingData();
      await refreshPendingActions();
      
      const syncTime = await offlineService.getLastSyncTime();
      setLastSyncTime(syncTime);
      
    } catch (error) {
      console.error('Error syncing pending data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setIsLoading(true);
      
      await offlineService.clearCache();
      await refreshJobs();
      await refreshPendingActions();
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCacheSize = async (): Promise<number> => {
    try {
      return await offlineService.getCacheSize();
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  };

  const value: OfflineContextType = {
    jobs,
    pendingActions,
    isOnline,
    isLoading,
    lastSyncTime,
    refreshJobs,
    acceptJob,
    updateJobStatus,
    downloadOfflineData,
    syncPendingData,
    clearCache,
    getCacheSize,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
