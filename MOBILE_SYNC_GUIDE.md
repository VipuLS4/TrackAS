# TrackAS Mobile Driver App - Sync & Offline Guide

## 📱 Overview

The TrackAS Driver App is a React Native application built with Expo that provides comprehensive offline capabilities, real-time synchronization, and Firebase push notifications. This guide covers the mobile app architecture, offline functionality, and synchronization mechanisms.

## 🎯 Key Features

### **Offline-First Architecture**
- SQLite local database for data persistence
- Automatic sync when connectivity is restored
- Offline job acceptance and status updates
- Cached location and route data

### **Real-Time Synchronization**
- Automatic data sync on network restoration
- Conflict resolution for offline/online data
- Pending actions queue management
- Background sync capabilities

### **Firebase Integration**
- Push notifications for job alerts
- Real-time location tracking
- Authentication and user management
- Cloud messaging and analytics

### **Location Services**
- GPS tracking with geofencing
- Route recording and optimization
- Offline map caching
- Battery-optimized location updates

## 🏗️ App Architecture

### **Core Services**

#### **1. AuthService**
```typescript
// Firebase-based authentication
export class AuthService {
  async signIn(email: string, password: string): Promise<DriverUser>
  async signOut(): Promise<void>
  async updateDriverStatus(isOnline: boolean): Promise<void>
  async updateLocation(latitude: number, longitude: number): Promise<void>
}
```

#### **2. OfflineService**
```typescript
// SQLite-based offline storage
export class OfflineService {
  async saveJob(job: OfflineJob): Promise<void>
  async getJobs(): Promise<OfflineJob[]>
  async updateJobStatus(jobId: string, status: string): Promise<void>
  async syncPendingData(): Promise<void>
  async addPendingAction(action: PendingAction): Promise<void>
}
```

#### **3. NotificationService**
```typescript
// Firebase push notifications
export class NotificationService {
  async notifyJobAvailable(jobData: any): Promise<void>
  async notifyJobAccepted(jobData: any): Promise<void>
  async notifyPaymentReceived(amount: number): Promise<void>
  async scheduleLocalNotification(notification: NotificationData): Promise<string>
}
```

#### **4. LocationService**
```typescript
// GPS and location management
export class LocationService {
  async getCurrentLocation(): Promise<LocationData | null>
  async startLocationTracking(callback: Function): Promise<void>
  async stopLocationTracking(): Promise<void>
  async startRouteTracking(routeId: string): Promise<void>
  async createGeofence(id: string, lat: number, lng: number, radius: number): Promise<void>
}
```

## 📊 Data Models

### **OfflineJob**
```typescript
interface OfflineJob {
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
```

### **PendingAction**
```typescript
interface PendingAction {
  id: string;
  type: 'accept_job' | 'update_status' | 'upload_proof' | 'rate_customer';
  data: any;
  timestamp: string;
  retryCount: number;
}
```

### **LocationData**
```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}
```

## 🔄 Synchronization Flow

### **1. Online Mode**
```typescript
// Real-time data sync
const syncFlow = {
  1: 'Receive job from server',
  2: 'Store in local SQLite database',
  3: 'Update UI immediately',
  4: 'Send status updates to server',
  5: 'Receive push notifications'
};
```

### **2. Offline Mode**
```typescript
// Offline-first operations
const offlineFlow = {
  1: 'Accept job locally',
  2: 'Store in pending actions queue',
  3: 'Update local database',
  4: 'Show offline indicator',
  5: 'Queue for sync when online'
};
```

### **3. Sync Process**
```typescript
// Automatic sync when connectivity restored
const syncProcess = {
  1: 'Detect network restoration',
  2: 'Process pending actions queue',
  3: 'Sync local changes to server',
  4: 'Download new data from server',
  5: 'Resolve conflicts if any',
  6: 'Update UI with synced data'
};
```

## 📱 Screen Components

### **Main Navigation**
```typescript
// Bottom tab navigation
const TabNavigator = {
  Dashboard: 'Overview and status',
  Jobs: 'Available and active jobs',
  Tracking: 'Live GPS tracking',
  Profile: 'Driver profile and settings'
};
```

### **Key Screens**

#### **DashboardScreen**
- Driver status (online/offline)
- Quick stats and earnings
- Recent jobs overview
- Sync status indicator

#### **JobsScreen**
- Available jobs list
- Job details and acceptance
- Active jobs management
- Offline job queue

#### **TrackingScreen**
- Live GPS tracking
- Route visualization
- Location history
- Geofence monitoring

#### **ProfileScreen**
- Driver information
- Vehicle details
- Earnings history
- Settings and preferences

## 🔧 Offline Functionality

### **Data Persistence**
```typescript
// SQLite database schema
const databaseSchema = {
  jobs: `
    CREATE TABLE jobs (
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
  `,
  pending_actions: `
    CREATE TABLE pending_actions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0
    );
  `
};
```

### **Offline Job Management**
```typescript
// Accept job while offline
async function acceptJobOffline(jobId: string) {
  try {
    // Update local database
    await offlineService.updateJobStatus(jobId, 'accepted');
    
    // Add to pending actions
    await offlineService.addPendingAction({
      type: 'accept_job',
      data: { jobId, timestamp: new Date().toISOString() }
    });
    
    // Show offline indicator
    showOfflineIndicator();
    
    // Notify user
    await notificationService.notifyJobAccepted(jobData);
  } catch (error) {
    console.error('Error accepting job offline:', error);
  }
}
```

### **Sync Conflict Resolution**
```typescript
// Handle sync conflicts
async function resolveConflicts(localData: any, serverData: any) {
  const conflicts = detectConflicts(localData, serverData);
  
  for (const conflict of conflicts) {
    switch (conflict.type) {
      case 'job_status':
        // Use server status if more recent
        if (serverData.updatedAt > localData.updatedAt) {
          await updateLocalJob(serverData);
        }
        break;
      case 'location_update':
        // Merge location data
        await mergeLocationData(localData, serverData);
        break;
      default:
        // Use server data as source of truth
        await updateLocalData(serverData);
    }
  }
}
```

## 🔔 Push Notifications

### **Firebase Configuration**
```typescript
// Firebase setup
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "trackas-driver.firebaseapp.com",
  projectId: "trackas-driver",
  storageBucket: "trackas-driver.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### **Notification Types**
```typescript
// Different notification types
const notificationTypes = {
  job_available: {
    title: 'New Job Available! 🚚',
    body: 'Pickup from Mumbai to Pune',
    priority: 'high',
    data: { type: 'job_available', jobId: 'job_123' }
  },
  job_accepted: {
    title: 'Job Accepted ✅',
    body: 'Pickup scheduled for 10:00 AM',
    priority: 'normal',
    data: { type: 'job_accepted', jobId: 'job_123' }
  },
  payment_received: {
    title: 'Payment Received 💰',
    body: '₹2500 credited to your account',
    priority: 'normal',
    data: { type: 'payment_received', amount: 2500 }
  },
  job_reminder: {
    title: 'Job Reminder ⏰',
    body: 'Pickup in 30 minutes',
    priority: 'high',
    scheduledTime: '2024-01-15T10:30:00Z'
  }
};
```

### **Notification Handling**
```typescript
// Handle notification taps
async function handleNotificationTap(response: NotificationResponse) {
  const data = response.notification.request.content.data;
  
  switch (data.type) {
    case 'job_available':
      // Navigate to job details
      navigation.navigate('JobDetails', { jobId: data.jobId });
      break;
    case 'payment_received':
      // Navigate to earnings screen
      navigation.navigate('Profile', { tab: 'earnings' });
      break;
    default:
      // Navigate to dashboard
      navigation.navigate('Dashboard');
  }
}
```

## 📍 Location Services

### **GPS Tracking**
```typescript
// Start location tracking
async function startLocationTracking() {
  try {
    // Request permissions
    await locationService.requestPermissions();
    
    // Start tracking with high accuracy
    await locationService.startLocationTracking(
      (location) => {
        // Update driver location
        updateDriverLocation(location);
        
        // Check geofences
        checkGeofences(location);
        
        // Store location history
        storeLocationHistory(location);
      },
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 seconds
        distanceInterval: 10 // 10 meters
      }
    );
  } catch (error) {
    console.error('Error starting location tracking:', error);
  }
}
```

### **Geofencing**
```typescript
// Create pickup/delivery geofences
async function createJobGeofences(job: OfflineJob) {
  // Pickup geofence
  await locationService.createGeofence(
    `pickup_${job.id}`,
    job.pickupLocation.latitude,
    job.pickupLocation.longitude,
    100 // 100 meter radius
  );
  
  // Delivery geofence
  await locationService.createGeofence(
    `delivery_${job.id}`,
    job.deliveryLocation.latitude,
    job.deliveryLocation.longitude,
    100 // 100 meter radius
  );
}

// Handle geofence events
async function handleGeofenceEvent(event: GeofenceEvent) {
  if (event.type === 'enter') {
    if (event.geofenceId.startsWith('pickup_')) {
      await notifyPickupArrival(event.geofenceId);
    } else if (event.geofenceId.startsWith('delivery_')) {
      await notifyDeliveryArrival(event.geofenceId);
    }
  }
}
```

### **Route Tracking**
```typescript
// Track route for a job
async function trackJobRoute(jobId: string) {
  try {
    // Start route tracking
    await locationService.startRouteTracking(jobId);
    
    // Get route data
    const routeData = await locationService.getRouteData(jobId);
    
    // Calculate metrics
    const metrics = {
      distance: routeData.distance,
      duration: routeData.duration,
      averageSpeed: calculateAverageSpeed(routeData),
      efficiency: calculateRouteEfficiency(routeData)
    };
    
    // Store route metrics
    await storeRouteMetrics(jobId, metrics);
    
  } catch (error) {
    console.error('Error tracking route:', error);
  }
}
```

## 🔄 Background Sync

### **Sync Strategy**
```typescript
// Background sync configuration
const syncConfig = {
  interval: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  batchSize: 10,
  priority: ['job_status', 'location_update', 'payment_confirmation']
};

// Background sync implementation
async function performBackgroundSync() {
  try {
    // Check network connectivity
    if (!await isOnline()) {
      return;
    }
    
    // Get pending actions
    const pendingActions = await offlineService.getPendingActions();
    
    // Process in batches
    const batches = chunkArray(pendingActions, syncConfig.batchSize);
    
    for (const batch of batches) {
      await processBatch(batch);
    }
    
    // Download new data
    await downloadNewData();
    
    // Update last sync time
    await updateLastSyncTime();
    
  } catch (error) {
    console.error('Background sync error:', error);
    await scheduleRetry();
  }
}
```

### **Sync Monitoring**
```typescript
// Monitor sync status
class SyncMonitor {
  private syncStats = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    lastSyncTime: null,
    averageSyncTime: 0
  };
  
  async recordSync(success: boolean, duration: number) {
    this.syncStats.totalSyncs++;
    
    if (success) {
      this.syncStats.successfulSyncs++;
    } else {
      this.syncStats.failedSyncs++;
    }
    
    this.syncStats.lastSyncTime = new Date().toISOString();
    this.syncStats.averageSyncTime = 
      (this.syncStats.averageSyncTime + duration) / 2;
    
    // Store stats
    await this.storeSyncStats();
  }
  
  getSyncHealth(): 'healthy' | 'warning' | 'critical' {
    const successRate = this.syncStats.successfulSyncs / this.syncStats.totalSyncs;
    
    if (successRate >= 0.95) return 'healthy';
    if (successRate >= 0.80) return 'warning';
    return 'critical';
  }
}
```

## 📊 Performance Optimization

### **Database Optimization**
```typescript
// Database performance tuning
const dbOptimizations = {
  indexing: [
    'CREATE INDEX idx_jobs_status ON jobs(status)',
    'CREATE INDEX idx_jobs_created_at ON jobs(created_at)',
    'CREATE INDEX idx_pending_actions_timestamp ON pending_actions(timestamp)'
  ],
  queryOptimization: {
    limitResults: 100,
    usePreparedStatements: true,
    batchOperations: true
  },
  cleanup: {
    maxHistoryDays: 30,
    maxPendingActions: 1000,
    compressOldData: true
  }
};
```

### **Memory Management**
```typescript
// Memory optimization strategies
const memoryOptimizations = {
  imageCaching: {
    maxCacheSize: '50MB',
    compressionQuality: 0.8,
    lazyLoading: true
  },
  dataCaching: {
    maxJobsInMemory: 50,
    maxLocationHistory: 1000,
    clearOnBackground: true
  },
  backgroundTasks: {
    limitConcurrentTasks: 3,
    timeoutMs: 30000,
    retryPolicy: 'exponential'
  }
};
```

## 🚀 Deployment & Build

### **Expo Configuration**
```json
{
  "expo": {
    "name": "TrackAS Driver",
    "slug": "trackas-driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.trackas.driver"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.trackas.driver",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "WAKE_LOCK"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-location",
      "expo-notifications",
      "expo-sqlite"
    ]
  }
}
```

### **Build Commands**
```bash
# Development
npm run start
npm run android
npm run ios
npm run web

# Production build
expo build:android
expo build:ios

# EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

## 🔧 Configuration

### **Environment Variables**
```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=trackas-driver.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=trackas-driver
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=trackas-driver.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.trackas.com
EXPO_PUBLIC_API_TIMEOUT=30000

# Sync Configuration
EXPO_PUBLIC_SYNC_INTERVAL=30000
EXPO_PUBLIC_MAX_RETRY_ATTEMPTS=3
EXPO_PUBLIC_BATCH_SIZE=10
```

### **App Configuration**
```typescript
// App configuration
export const AppConfig = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS || '3')
  },
  sync: {
    interval: parseInt(process.env.EXPO_PUBLIC_SYNC_INTERVAL || '30000'),
    batchSize: parseInt(process.env.EXPO_PUBLIC_BATCH_SIZE || '10'),
    maxPendingActions: 1000
  },
  location: {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    maxHistoryDays: 30
  },
  notifications: {
    maxStoredNotifications: 100,
    autoCleanupDays: 7
  }
};
```

## 🧪 Testing

### **Unit Tests**
```typescript
// Example test for OfflineService
describe('OfflineService', () => {
  beforeEach(async () => {
    await offlineService.clearCache();
  });
  
  it('should save job offline', async () => {
    const job: OfflineJob = {
      id: 'test_job',
      title: 'Test Job',
      // ... other properties
    };
    
    await offlineService.saveJob(job);
    const savedJobs = await offlineService.getJobs();
    
    expect(savedJobs).toHaveLength(1);
    expect(savedJobs[0].id).toBe('test_job');
  });
  
  it('should sync pending actions', async () => {
    await offlineService.addPendingAction({
      type: 'accept_job',
      data: { jobId: 'test_job' }
    });
    
    await offlineService.syncPendingData();
    const pendingActions = await offlineService.getPendingActions();
    
    expect(pendingActions).toHaveLength(0);
  });
});
```

### **Integration Tests**
```typescript
// Example integration test
describe('Job Acceptance Flow', () => {
  it('should accept job and sync when online', async () => {
    // Setup
    const job = createMockJob();
    await offlineService.saveJob(job);
    
    // Accept job
    await offlineService.updateJobStatus(job.id, 'accepted');
    
    // Sync
    await offlineService.syncPendingData();
    
    // Verify
    const updatedJob = await offlineService.getJobs();
    expect(updatedJob[0].status).toBe('accepted');
  });
});
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Sync Failures**
```typescript
// Debug sync issues
async function debugSyncIssues() {
  const pendingActions = await offlineService.getPendingActions();
  const lastSyncTime = await offlineService.getLastSyncTime();
  const networkStatus = await Network.getNetworkStateAsync();
  
  console.log('Sync Debug Info:', {
    pendingActionsCount: pendingActions.length,
    lastSyncTime,
    isOnline: networkStatus.isConnected,
    isInternetReachable: networkStatus.isInternetReachable
  });
}
```

#### **Location Issues**
```typescript
// Debug location issues
async function debugLocationIssues() {
  const hasPermission = await Location.hasServicesEnabledAsync();
  const currentLocation = await Location.getCurrentPositionAsync();
  const locationAccuracy = await locationService.getLocationAccuracy();
  
  console.log('Location Debug Info:', {
    hasPermission,
    currentLocation,
    accuracy: locationAccuracy
  });
}
```

#### **Notification Issues**
```typescript
// Debug notification issues
async function debugNotificationIssues() {
  const permissions = await Notifications.getPermissionsAsync();
  const pushToken = await notificationService.getPushToken();
  const storedNotifications = await notificationService.getStoredNotifications();
  
  console.log('Notification Debug Info:', {
    permissions,
    pushToken,
    storedNotificationsCount: storedNotifications.length
  });
}
```

## 📚 Best Practices

### **1. Offline-First Design**
- Always design for offline scenarios first
- Cache critical data locally
- Provide clear offline indicators
- Implement graceful degradation

### **2. Data Synchronization**
- Use timestamps for conflict resolution
- Implement exponential backoff for retries
- Batch operations for efficiency
- Monitor sync health continuously

### **3. Performance**
- Optimize database queries
- Implement lazy loading
- Use image compression
- Monitor memory usage

### **4. User Experience**
- Show loading states
- Provide offline feedback
- Implement pull-to-refresh
- Handle errors gracefully

### **5. Security**
- Encrypt sensitive data
- Use secure storage
- Implement proper authentication
- Validate all inputs

---

**Note**: This mobile driver app is designed for enterprise-grade logistics operations with comprehensive offline capabilities. Ensure thorough testing, proper configuration, and security measures before production deployment.
