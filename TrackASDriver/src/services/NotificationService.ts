import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  type: 'job_available' | 'job_accepted' | 'job_reminder' | 'payment_received' | 'system_update';
  priority: 'low' | 'normal' | 'high';
  scheduledTime?: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get push token
      await this.getPushToken();
      
      // Set up listeners
      this.setupNotificationListeners();
      
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('NotificationService initialization error:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<void> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Notification permissions not granted');
      }

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      throw error;
    }
  }

  private async getPushToken(): Promise<void> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      // Store token for later use
      await AsyncStorage.setItem('expo_push_token', this.expoPushToken);
    } catch (error) {
      console.error('Error getting push token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listen for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      this.handleNotificationTap(response);
    });
  }

  private async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    try {
      // Store notification in local storage
      const notificationData: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        type: notification.request.content.data?.type || 'system_update',
        priority: 'normal',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      await this.storeNotification(notificationData);
    } catch (error) {
      console.error('Error handling notification received:', error);
    }
  }

  private async handleNotificationTap(response: Notifications.NotificationResponse): Promise<void> {
    try {
      const notificationId = response.notification.request.identifier;
      
      // Mark notification as read
      await this.markNotificationAsRead(notificationId);
      
      // Handle navigation based on notification type
      const data = response.notification.request.content.data;
      if (data?.type === 'job_available' && data?.jobId) {
        // Navigate to job details
        console.log(`Navigate to job details: ${data.jobId}`);
      } else if (data?.type === 'payment_received') {
        // Navigate to earnings screen
        console.log('Navigate to earnings screen');
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  // Local Notification Management
  async scheduleLocalNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    try {
      const notificationId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const trigger = notification.scheduledTime 
        ? { date: new Date(notification.scheduledTime) }
        : null;

      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      // Store notification data
      const notificationData: NotificationData = {
        id: notificationId,
        ...notification,
        createdAt: new Date().toISOString(),
        isRead: false
      };

      await this.storeNotification(notificationData);

      console.log(`Local notification scheduled: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await this.removeNotification(notificationId);
      console.log(`Notification cancelled: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await this.clearAllNotifications();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
      throw error;
    }
  }

  // Notification Storage
  private async storeNotification(notification: NotificationData): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      const limitedNotifications = notifications.slice(0, 100);
      
      await AsyncStorage.setItem('notifications', JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.isRead = true;
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.forEach(n => n.isRead = true);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  private async removeNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const filteredNotifications = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem('notifications', JSON.stringify(filteredNotifications));
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  }

  private async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notifications');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }

  // Specific Notification Types
  async notifyJobAvailable(jobData: any): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'New Job Available! 🚚',
      body: `Pickup from ${jobData.pickupLocation.address} to ${jobData.deliveryLocation.address}`,
      data: { type: 'job_available', jobId: jobData.id },
      type: 'job_available',
      priority: 'high'
    });
  }

  async notifyJobAccepted(jobData: any): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'Job Accepted ✅',
      body: `You've accepted the job. Pickup time: ${new Date(jobData.pickupTime).toLocaleTimeString()}`,
      data: { type: 'job_accepted', jobId: jobData.id },
      type: 'job_accepted',
      priority: 'normal'
    });
  }

  async notifyJobReminder(jobData: any): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'Job Reminder ⏰',
      body: `Your pickup is scheduled in 30 minutes at ${jobData.pickupLocation.address}`,
      data: { type: 'job_reminder', jobId: jobData.id },
      type: 'job_reminder',
      priority: 'high',
      scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
    });
  }

  async notifyPaymentReceived(amount: number): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'Payment Received 💰',
      body: `₹${amount} has been credited to your account`,
      data: { type: 'payment_received', amount },
      type: 'payment_received',
      priority: 'normal'
    });
  }

  async notifySystemUpdate(message: string): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'System Update 📱',
      body: message,
      data: { type: 'system_update' },
      type: 'system_update',
      priority: 'low'
    });
  }

  // Push Token Management
  async getPushToken(): Promise<string | null> {
    return this.expoPushToken;
  }

  async updatePushTokenOnServer(): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      // In a real app, this would send the token to your backend
      console.log('Updating push token on server:', this.expoPushToken);
      
      // Example API call:
      // await fetch('/api/driver/push-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pushToken: this.expoPushToken })
      // });
    } catch (error) {
      console.error('Error updating push token on server:', error);
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export const notificationService = NotificationService.getInstance();
