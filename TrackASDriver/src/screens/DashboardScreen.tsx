import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { locationService } from '../services/LocationService';
import { notificationService } from '../services/NotificationService';

export default function DashboardScreen() {
  const { user, updateDriverStatus, updateLocation } = useAuth();
  const { jobs, isOnline, lastSyncTime, refreshJobs, syncPendingData } = useOffline();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    initializeLocation();
    loadNotifications();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        await updateLocation(location.latitude, location.longitude);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await notificationService.getStoredNotifications();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      if (unreadCount > 0) {
        Alert.alert(
          'New Notifications',
          `You have ${unreadCount} unread notifications`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleToggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await updateDriverStatus(newStatus);
      setIsOnline(newStatus);
      
      if (newStatus) {
        await notificationService.notifySystemUpdate('You are now online and available for jobs');
      } else {
        await notificationService.notifySystemUpdate('You are now offline');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshJobs();
      if (isOnline) {
        await syncPendingData();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = () => {
    return isOnline ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    return isOnline ? 'Online' : 'Offline';
  };

  const availableJobs = jobs.filter(job => job.status === 'available');
  const activeJobs = jobs.filter(job => ['accepted', 'in_progress'].includes(job.status));

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Driver'}!</Text>
          <Text style={styles.subtitle}>Welcome back to TrackAS</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: getStatusColor() }]}
            onPress={handleToggleOnlineStatus}
          >
            <Text style={styles.toggleButtonText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusDetails}>
          <View style={styles.statusItem}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.statusItemText}>{user?.rating || 4.5} Rating</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="car" size={20} color="#3B82F6" />
            <Text style={styles.statusItemText}>{user?.totalTrips || 0} Trips</Text>
          </View>
          <View style={styles.statusItem}>
            <Ionicons name="location" size={20} color="#10B981" />
            <Text style={styles.statusItemText}>
              {currentLocation ? 'Location Active' : 'Location Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableJobs.length}</Text>
          <Text style={styles.statLabel}>Available Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeJobs.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {isOnline ? '₹0' : '₹0'}
          </Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No jobs available</Text>
            <Text style={styles.emptyStateSubtext}>
              {isOnline ? 'Jobs will appear here when available' : 'Go online to see available jobs'}
            </Text>
          </View>
        ) : (
          <View style={styles.jobsList}>
            {jobs.slice(0, 3).map((job) => (
              <TouchableOpacity key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.jobStatus, { backgroundColor: getJobStatusColor(job.status) }]}>
                    <Text style={styles.jobStatusText}>{job.status}</Text>
                  </View>
                </View>
                <Text style={styles.jobDescription}>{job.description}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.jobDetail}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.jobDetailText}>{job.pickupLocation.address}</Text>
                  </View>
                  <View style={styles.jobDetail}>
                    <Ionicons name="navigate" size={16} color="#6B7280" />
                    <Text style={styles.jobDetailText}>{job.deliveryLocation.address}</Text>
                  </View>
                  <View style={styles.jobDetail}>
                    <Ionicons name="cash" size={16} color="#10B981" />
                    <Text style={styles.jobDetailText}>₹{job.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Sync Status */}
      <View style={styles.syncStatus}>
        <Ionicons 
          name={isOnline ? "cloud-done" : "cloud-offline"} 
          size={16} 
          color={isOnline ? "#10B981" : "#EF4444"} 
        />
        <Text style={styles.syncStatusText}>
          {isOnline ? 'Synced' : 'Offline'} • 
          {lastSyncTime ? ` Last sync: ${new Date(lastSyncTime).toLocaleTimeString()}` : ' Never synced'}
        </Text>
      </View>
    </ScrollView>
  );
}

const getJobStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#3B82F6';
    case 'accepted': return '#F59E0B';
    case 'in_progress': return '#10B981';
    case 'completed': return '#6B7280';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItemText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  jobStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  jobDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  jobDetails: {
    gap: 8,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  syncStatusText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});
