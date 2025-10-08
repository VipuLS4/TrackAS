import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "trackas-driver.firebaseapp.com",
  projectId: "trackas-driver",
  storageBucket: "trackas-driver.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

export interface DriverUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalTrips: number;
  joinedDate: string;
}

export class AuthService {
  private static instance: AuthService;
  private auth: any;
  private currentUser: DriverUser | null = null;

  private constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check for stored user data
      const storedUser = await AsyncStorage.getItem('driver_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }

      // Set up auth state listener
      onAuthStateChanged(this.auth, async (user: User | null) => {
        if (user) {
          await this.loadDriverProfile(user.uid);
        } else {
          this.currentUser = null;
          await AsyncStorage.removeItem('driver_user');
        }
      });
    } catch (error) {
      console.error('AuthService initialization error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<DriverUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Load driver profile
      await this.loadDriverProfile(user.uid);
      
      if (!this.currentUser) {
        throw new Error('Failed to load driver profile');
      }

      return this.currentUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      await AsyncStorage.removeItem('driver_user');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<DriverUser | null> {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async updateDriverStatus(isOnline: boolean): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      this.currentUser.isOnline = isOnline;
      await this.saveDriverProfile();
      
      // Update server status
      await this.updateServerStatus(isOnline);
    } catch (error) {
      console.error('Update driver status error:', error);
      throw error;
    }
  }

  async updateLocation(latitude: number, longitude: number): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      this.currentUser.currentLocation = { latitude, longitude };
      await this.saveDriverProfile();
      
      // Update server location
      await this.updateServerLocation(latitude, longitude);
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  }

  private async loadDriverProfile(userId: string): Promise<void> {
    try {
      // In a real app, this would fetch from your backend API
      // For now, we'll create a mock driver profile
      const mockDriver: DriverUser = {
        id: userId,
        email: 'driver@trackas.com',
        name: 'John Driver',
        phone: '+91 9876543210',
        licenseNumber: 'DL123456789',
        vehicleType: 'Truck',
        vehicleNumber: 'MH01AB1234',
        isOnline: false,
        rating: 4.5,
        totalTrips: 150,
        joinedDate: '2023-01-15'
      };

      this.currentUser = mockDriver;
      await this.saveDriverProfile();
    } catch (error) {
      console.error('Load driver profile error:', error);
      throw error;
    }
  }

  private async saveDriverProfile(): Promise<void> {
    if (this.currentUser) {
      await AsyncStorage.setItem('driver_user', JSON.stringify(this.currentUser));
    }
  }

  private async updateServerStatus(isOnline: boolean): Promise<void> {
    // In a real app, this would make an API call to update server status
    console.log(`Updating server status: ${isOnline ? 'online' : 'offline'}`);
  }

  private async updateServerLocation(latitude: number, longitude: number): Promise<void> {
    // In a real app, this would make an API call to update server location
    console.log(`Updating server location: ${latitude}, ${longitude}`);
  }
}

export const authService = AuthService.getInstance();
