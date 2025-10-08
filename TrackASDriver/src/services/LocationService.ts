import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface GeofenceEvent {
  id: string;
  type: 'enter' | 'exit';
  location: LocationData;
  geofenceId: string;
  timestamp: string;
}

export class LocationService {
  private static instance: LocationService;
  private watchId: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private currentLocation: LocationData | null = null;
  private locationUpdateCallback: ((location: LocationData) => void) | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request location permissions
      await this.requestPermissions();
      
      // Get initial location
      await this.getCurrentLocation();
      
      console.log('LocationService initialized successfully');
    } catch (error) {
      console.error('LocationService initialization error:', error);
      throw error;
    }
  }

  private async requestPermissions(): Promise<void> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      // Request background location permission for Android
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      console.log('Location permissions granted');
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      throw error;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
        timestamp: new Date().toISOString(),
      };

      this.currentLocation = locationData;
      await this.storeLocation(locationData);

      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async startLocationTracking(
    callback?: (location: LocationData) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<void> {
    try {
      if (this.isTracking) {
        console.log('Location tracking already started');
        return;
      }

      this.locationUpdateCallback = callback || null;

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.High,
          timeInterval: options.timeInterval || 5000, // 5 seconds
          distanceInterval: options.distanceInterval || 10, // 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            speed: location.coords.speed || undefined,
            heading: location.coords.heading || undefined,
            timestamp: new Date().toISOString(),
          };

          this.currentLocation = locationData;
          this.storeLocation(locationData);

          if (this.locationUpdateCallback) {
            this.locationUpdateCallback(locationData);
          }
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  async stopLocationTracking(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      this.isTracking = false;
      this.locationUpdateCallback = null;
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      throw error;
    }
  }

  async getLocationHistory(limit: number = 100): Promise<LocationData[]> {
    try {
      const stored = await AsyncStorage.getItem('location_history');
      const history = stored ? JSON.parse(stored) : [];
      
      return history.slice(-limit);
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  private async storeLocation(location: LocationData): Promise<void> {
    try {
      const history = await this.getLocationHistory(1000); // Keep last 1000 locations
      history.push(location);
      
      // Keep only last 1000 locations
      const limitedHistory = history.slice(-1000);
      
      await AsyncStorage.setItem('location_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  async clearLocationHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem('location_history');
      console.log('Location history cleared');
    } catch (error) {
      console.error('Error clearing location history:', error);
    }
  }

  // Geocoding
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        return `${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.country || ''}`.trim();
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async geocode(address: string): Promise<LocationData | null> {
    try {
      const result = await Location.geocodeAsync(address);

      if (result.length > 0) {
        const location = result[0];
        return {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }

  // Distance Calculation
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Geofencing
  async createGeofence(
    id: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<void> {
    try {
      // In a real app, this would use a proper geofencing library
      console.log(`Geofence created: ${id} at ${latitude}, ${longitude} with radius ${radius}m`);
      
      // Store geofence data
      const geofences = await this.getStoredGeofences();
      geofences.push({ id, latitude, longitude, radius });
      await AsyncStorage.setItem('geofences', JSON.stringify(geofences));
    } catch (error) {
      console.error('Error creating geofence:', error);
      throw error;
    }
  }

  async removeGeofence(id: string): Promise<void> {
    try {
      const geofences = await this.getStoredGeofences();
      const filteredGeofences = geofences.filter(g => g.id !== id);
      await AsyncStorage.setItem('geofences', JSON.stringify(filteredGeofences));
      console.log(`Geofence removed: ${id}`);
    } catch (error) {
      console.error('Error removing geofence:', error);
      throw error;
    }
  }

  private async getStoredGeofences(): Promise<any[]> {
    try {
      const stored = await AsyncStorage.getItem('geofences');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored geofences:', error);
      return [];
    }
  }

  async checkGeofences(location: LocationData): Promise<GeofenceEvent[]> {
    try {
      const geofences = await this.getStoredGeofences();
      const events: GeofenceEvent[] = [];

      for (const geofence of geofences) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          geofence.latitude,
          geofence.longitude
        );

        const distanceInMeters = distance * 1000;

        if (distanceInMeters <= geofence.radius) {
          events.push({
            id: `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'enter',
            location,
            geofenceId: geofence.id,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return events;
    } catch (error) {
      console.error('Error checking geofences:', error);
      return [];
    }
  }

  // Utility Methods
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  isLocationTracking(): boolean {
    return this.isTracking;
  }

  async getLocationAccuracy(): Promise<Location.Accuracy> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (location.coords.accuracy && location.coords.accuracy <= 5) {
        return Location.Accuracy.Highest;
      } else if (location.coords.accuracy && location.coords.accuracy <= 10) {
        return Location.Accuracy.High;
      } else if (location.coords.accuracy && location.coords.accuracy <= 20) {
        return Location.Accuracy.Balanced;
      } else {
        return Location.Accuracy.Low;
      }
    } catch (error) {
      console.error('Error getting location accuracy:', error);
      return Location.Accuracy.Low;
    }
  }

  // Route Tracking
  async startRouteTracking(routeId: string): Promise<void> {
    try {
      console.log(`Starting route tracking for route: ${routeId}`);
      
      // Store route start time
      await AsyncStorage.setItem(`route_${routeId}_start`, new Date().toISOString());
      
      // Start location tracking with higher frequency
      await this.startLocationTracking(
        (location) => {
          this.storeRouteLocation(routeId, location);
        },
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // 2 seconds
          distanceInterval: 5, // 5 meters
        }
      );
    } catch (error) {
      console.error('Error starting route tracking:', error);
      throw error;
    }
  }

  async stopRouteTracking(routeId: string): Promise<void> {
    try {
      console.log(`Stopping route tracking for route: ${routeId}`);
      
      // Store route end time
      await AsyncStorage.setItem(`route_${routeId}_end`, new Date().toISOString());
      
      // Stop location tracking
      await this.stopLocationTracking();
    } catch (error) {
      console.error('Error stopping route tracking:', error);
      throw error;
    }
  }

  private async storeRouteLocation(routeId: string, location: LocationData): Promise<void> {
    try {
      const routeKey = `route_${routeId}_locations`;
      const stored = await AsyncStorage.getItem(routeKey);
      const locations = stored ? JSON.parse(stored) : [];
      
      locations.push(location);
      await AsyncStorage.setItem(routeKey, JSON.stringify(locations));
    } catch (error) {
      console.error('Error storing route location:', error);
    }
  }

  async getRouteData(routeId: string): Promise<{
    startTime: string | null;
    endTime: string | null;
    locations: LocationData[];
    distance: number;
    duration: number;
  }> {
    try {
      const startTime = await AsyncStorage.getItem(`route_${routeId}_start`);
      const endTime = await AsyncStorage.getItem(`route_${routeId}_end`);
      const locationsStored = await AsyncStorage.getItem(`route_${routeId}_locations`);
      const locations = locationsStored ? JSON.parse(locationsStored) : [];

      let distance = 0;
      for (let i = 1; i < locations.length; i++) {
        const prev = locations[i - 1];
        const curr = locations[i];
        distance += this.calculateDistance(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude
        );
      }

      const duration = startTime && endTime 
        ? new Date(endTime).getTime() - new Date(startTime).getTime()
        : 0;

      return {
        startTime,
        endTime,
        locations,
        distance: distance * 1000, // Convert to meters
        duration, // in milliseconds
      };
    } catch (error) {
      console.error('Error getting route data:', error);
      return {
        startTime: null,
        endTime: null,
        locations: [],
        distance: 0,
        duration: 0,
      };
    }
  }
}

export const locationService = LocationService.getInstance();
