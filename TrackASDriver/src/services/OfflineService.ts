import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';

export interface OfflineJob {
  id: string;
  title: string;
  description: string;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  pickupTime: string;
  deliveryTime: string;
  distance: number;
  price: number;
  status: 'available' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  isOffline: boolean;
}

export interface OfflineData {
  jobs: OfflineJob[];
  lastSyncTime: string;
  pendingActions: PendingAction[];
}

export interface PendingAction {
  id: string;
  type: 'accept_job' | 'update_status' | 'upload_proof' | 'rate_customer';
  data: any;
  timestamp: string;
  retryCount: number;
}

export class OfflineService {
  private static instance: OfflineService;
  private db: SQLite.SQLiteDatabase | null = null;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;

  private constructor() {}

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize SQLite database
      this.db = await SQLite.openDatabaseAsync('trackas_driver.db');
      
      // Create tables
      await this.createTables();
      
      // Check network status
      await this.checkNetworkStatus();
      
      // Set up network listener
      this.setupNetworkListener();
      
      console.log('OfflineService initialized successfully');
    } catch (error) {
      console.error('OfflineService initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    try {
      // Jobs table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS jobs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          pickup_address TEXT NOT NULL,
          pickup_latitude REAL NOT NULL,
          pickup_longitude REAL NOT NULL,
          delivery_address TEXT NOT NULL,
          delivery_latitude REAL NOT NULL,
          delivery_longitude REAL NOT NULL,
          pickup_time TEXT NOT NULL,
          delivery_time TEXT NOT NULL,
          distance REAL NOT NULL,
          price REAL NOT NULL,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_offline INTEGER DEFAULT 0
        );
      `);

      // Pending actions table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS pending_actions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0
        );
      `);

      // Sync status table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_status (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  private async checkNetworkStatus(): Promise<void> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected && networkState.isInternetReachable;
      console.log(`Network status: ${this.isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('Error checking network status:', error);
      this.isOnline = false;
    }
  }

  private setupNetworkListener(): void {
    // Listen for network state changes
    Network.addNetworkStateListener((networkState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = networkState.isConnected && networkState.isInternetReachable;
      
      if (wasOffline && this.isOnline) {
        console.log('Network restored, starting sync...');
        this.syncPendingData();
      }
    });
  }

  // Job Management
  async saveJob(job: OfflineJob): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO jobs (
          id, title, description, pickup_address, pickup_latitude, pickup_longitude,
          delivery_address, delivery_latitude, delivery_longitude, pickup_time,
          delivery_time, distance, price, status, created_at, updated_at, is_offline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        job.id, job.title, job.description,
        job.pickupLocation.address, job.pickupLocation.latitude, job.pickupLocation.longitude,
        job.deliveryLocation.address, job.deliveryLocation.latitude, job.deliveryLocation.longitude,
        job.pickupTime, job.deliveryTime, job.distance, job.price,
        job.status, job.createdAt, job.updatedAt, job.isOffline ? 1 : 0
      ]);

      console.log(`Job ${job.id} saved to offline storage`);
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  async getJobs(): Promise<OfflineJob[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM jobs ORDER BY created_at DESC
      `);

      return result.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        pickupLocation: {
          address: row.pickup_address,
          latitude: row.pickup_latitude,
          longitude: row.pickup_longitude
        },
        deliveryLocation: {
          address: row.delivery_address,
          latitude: row.delivery_latitude,
          longitude: row.delivery_longitude
        },
        pickupTime: row.pickup_time,
        deliveryTime: row.delivery_time,
        distance: row.distance,
        price: row.price,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isOffline: row.is_offline === 1
      }));
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }

  async updateJobStatus(jobId: string, status: OfflineJob['status']): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`
        UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?
      `, [status, new Date().toISOString(), jobId]);

      // If offline, add to pending actions
      if (!this.isOnline) {
        await this.addPendingAction({
          type: 'update_status',
          data: { jobId, status }
        });
      }

      console.log(`Job ${jobId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  // Pending Actions Management
  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db.runAsync(`
        INSERT INTO pending_actions (id, type, data, timestamp, retry_count)
        VALUES (?, ?, ?, ?, ?)
      `, [id, action.type, JSON.stringify(action.data), new Date().toISOString(), 0]);

      console.log(`Pending action ${id} added`);
    } catch (error) {
      console.error('Error adding pending action:', error);
      throw error;
    }
  }

  async getPendingActions(): Promise<PendingAction[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM pending_actions ORDER BY timestamp ASC
      `);

      return result.map((row: any) => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
        retryCount: row.retry_count
      }));
    } catch (error) {
      console.error('Error getting pending actions:', error);
      throw error;
    }
  }

  async removePendingAction(actionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(`
        DELETE FROM pending_actions WHERE id = ?
      `, [actionId]);

      console.log(`Pending action ${actionId} removed`);
    } catch (error) {
      console.error('Error removing pending action:', error);
      throw error;
    }
  }

  // Sync Management
  async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    console.log('Starting data sync...');

    try {
      const pendingActions = await this.getPendingActions();
      
      for (const action of pendingActions) {
        try {
          await this.processPendingAction(action);
          await this.removePendingAction(action.id);
        } catch (error) {
          console.error(`Error processing action ${action.id}:`, error);
          
          // Increment retry count
          await this.incrementRetryCount(action.id);
          
          // Remove if max retries reached
          if (action.retryCount >= 3) {
            await this.removePendingAction(action.id);
            console.log(`Action ${action.id} removed after max retries`);
          }
        }
      }

      // Update last sync time
      await this.updateLastSyncTime();
      
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Error during data sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processPendingAction(action: PendingAction): Promise<void> {
    // In a real app, this would make API calls to your backend
    console.log(`Processing action: ${action.type}`, action.data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async incrementRetryCount(actionId: string): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(`
        UPDATE pending_actions SET retry_count = retry_count + 1 WHERE id = ?
      `, [actionId]);
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  }

  private async updateLastSyncTime(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(`
        INSERT OR REPLACE INTO sync_status (key, value, updated_at)
        VALUES ('last_sync', ?, ?)
      `, [new Date().toISOString(), new Date().toISOString()]);
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    if (!this.db) return null;

    try {
      const result = await this.db.getFirstAsync(`
        SELECT value FROM sync_status WHERE key = 'last_sync'
      `);

      return result ? (result as any).value : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Cache Management
  async clearCache(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execAsync(`
        DELETE FROM jobs WHERE is_offline = 1;
        DELETE FROM pending_actions;
      `);

      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) return 0;

    try {
      const result = await this.db.getFirstAsync(`
        SELECT COUNT(*) as count FROM jobs WHERE is_offline = 1
      `);

      return result ? (result as any).count : 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  // Utility Methods
  isOnline(): boolean {
    return this.isOnline;
  }

  async downloadOfflineData(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot download data while offline');
    }

    try {
      // In a real app, this would fetch data from your API
      console.log('Downloading offline data...');
      
      // Simulate data download
      const mockJobs: OfflineJob[] = [
        {
          id: 'job_1',
          title: 'Package Delivery',
          description: 'Deliver package from Mumbai to Pune',
          pickupLocation: {
            address: 'Mumbai Central',
            latitude: 19.0176,
            longitude: 72.8562
          },
          deliveryLocation: {
            address: 'Pune Station',
            latitude: 18.5204,
            longitude: 73.8567
          },
          pickupTime: '2024-01-15T10:00:00Z',
          deliveryTime: '2024-01-15T14:00:00Z',
          distance: 150,
          price: 2500,
          status: 'available',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOffline: true
        }
      ];

      for (const job of mockJobs) {
        await this.saveJob(job);
      }

      console.log('Offline data downloaded successfully');
    } catch (error) {
      console.error('Error downloading offline data:', error);
      throw error;
    }
  }
}

export const offlineService = OfflineService.getInstance();
