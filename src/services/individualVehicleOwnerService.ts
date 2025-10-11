import { IndividualVehicleOwnerUser, IVOTripDetails, IVOWallet, IVOTripHistory, IVODocument, IVOPerformance, IVORegistrationData, IVOKPIs } from '../types/individualVehicleOwner';

// Mock data for demonstration
const mockIVOUser: IndividualVehicleOwnerUser = {
  id: 'ivo-1',
  email: 'ivo@example.com',
  name: 'Raj Individual',
  phone: '+91-9876543210',
  address: '123 Individual St, Mumbai',
  panNumber: 'PAN123456789',
  role: 'individual',
  kycStatus: 'verified',
  walletBalance: 25000,
  reliabilityScore: 4.5,
  isOnline: true,
  currentLocation: { lat: 19.0760, lng: 72.8777 },
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export class IndividualVehicleOwnerService {
  // Authentication
  static async loginIVO(email: string, password: string): Promise<IndividualVehicleOwnerUser> {
    if (email === 'ivo@example.com' && password === 'ivo123') {
      return mockIVOUser;
    }
    throw new Error('Invalid credentials');
  }

  static async registerIVO(data: IVORegistrationData): Promise<IndividualVehicleOwnerUser> {
    return Promise.resolve({
      id: 'ivo-new',
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      panNumber: data.panNumber,
      role: 'individual',
      kycStatus: 'pending',
      walletBalance: 0,
      reliabilityScore: 0,
      isOnline: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  }

  static async logoutIVO(): Promise<void> {
    return Promise.resolve();
  }

  // Trip Management
  static async getAvailableTrips(): Promise<IVOTripDetails[]> {
    return Promise.resolve([
      {
        id: 'trip-1',
        shipmentId: 'shipment-1',
        pickupAddress: 'Mumbai, Maharashtra',
        deliveryAddress: 'Delhi, Delhi',
        pickupDate: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 50,
        value: 10000,
        offeredPrice: 2500,
        distance: 1200,
        status: 'available',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async getActiveTrip(): Promise<IVOTripDetails | null> {
    return Promise.resolve({
      id: 'trip-active',
      shipmentId: 'shipment-active',
      pickupAddress: 'Mumbai, Maharashtra',
      deliveryAddress: 'Delhi, Delhi',
      pickupDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 50,
      value: 10000,
      offeredPrice: 2500,
      distance: 1200,
      status: 'in_transit',
      createdAt: new Date().toISOString(),
    });
  }

  static async acceptTrip(tripId: string): Promise<void> {
    return Promise.resolve();
  }

  static async updateTripStatus(tripId: string, status: string): Promise<void> {
    return Promise.resolve();
  }

  static async completeTrip(tripId: string, podData: any): Promise<void> {
    return Promise.resolve();
  }

  // Trip History
  static async getTripHistory(): Promise<IVOTripHistory[]> {
    return Promise.resolve([
      {
        id: 'history-1',
        shipmentId: 'shipment-1',
        pickupAddress: 'Mumbai, Maharashtra',
        deliveryAddress: 'Delhi, Delhi',
        pickupDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 50,
        value: 10000,
        earnedAmount: 2500,
        distance: 1200,
        duration: 48,
        customerRating: 5,
        customerFeedback: 'Excellent service!',
        status: 'completed',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);
  }

  // Wallet Management
  static async getWallet(): Promise<IVOWallet> {
    return Promise.resolve({
      balance: 25000,
      transactions: [
        {
          id: 'txn-1',
          type: 'credit',
          amount: 2500,
          description: 'Trip payment',
          shipmentId: 'shipment-1',
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
      ],
      pendingAmount: 5000,
      totalEarnings: 125000,
      monthlyEarnings: 25000,
      commissionPaid: 6250,
    });
  }

  static async withdrawFunds(amount: number): Promise<void> {
    return Promise.resolve();
  }

  // Performance Tracking
  static async getPerformance(): Promise<IVOPerformance> {
    return Promise.resolve({
      totalTrips: 50,
      completedTrips: 48,
      cancelledTrips: 2,
      averageRating: 4.5,
      totalEarnings: 125000,
      monthlyEarnings: 25000,
      reliabilityScore: 4.5,
      onTimeDelivery: 95,
      customerSatisfaction: 4.5,
      lastUpdated: new Date().toISOString(),
    });
  }

  static async getKPIs(): Promise<IVOKPIs> {
    return Promise.resolve({
      tripCompletionRate: 96,
      averageTripValue: 2500,
      customerSatisfactionScore: 4.5,
      monthlyGrowthRate: 15,
      costPerTrip: 200,
      earningsPerTrip: 2500,
      onlineTimePercentage: 80,
    });
  }

  // Document Management
  static async uploadDocument(document: IVODocument): Promise<void> {
    return Promise.resolve();
  }

  static async getDocuments(): Promise<IVODocument[]> {
    return Promise.resolve([
      {
        id: 'doc-1',
        type: 'pan',
        url: 'https://example.com/pan.pdf',
        status: 'verified',
        uploadedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
      },
    ]);
  }

  // Location Management
  static async updateLocation(lat: number, lng: number): Promise<void> {
    return Promise.resolve();
  }

  static async setOnlineStatus(isOnline: boolean): Promise<void> {
    return Promise.resolve();
  }

  // Notifications
  static async getNotifications(): Promise<any[]> {
    return Promise.resolve([
      {
        id: 'notif-1',
        type: 'trip',
        title: 'New Trip Available',
        message: 'A new trip is available near your location',
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: '/trips',
      },
    ]);
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    return Promise.resolve();
  }
}
