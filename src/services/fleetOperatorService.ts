import { FleetOperatorUser, VehicleDetails, DriverProfile, FleetWallet, SubscriptionPlan, FleetAnalytics, KYCDocument, FleetRegistrationData, ShipmentOffer, ReliabilityScoreMetrics, NotificationEvent, FleetKPIs } from '../types/fleetOperator';

// Mock data for demonstration
const mockFleetOperator: FleetOperatorUser = {
  id: 'fleet-1',
  email: 'fleet@example.com',
  companyName: 'Fleet Co.',
  contactPerson: 'John Fleet',
  phone: '+91-9876543210',
  address: '123 Fleet St, Mumbai',
  gstNumber: 'GST123456789',
  panNumber: 'PAN123456789',
  role: 'fleet',
  kycStatus: 'verified',
  subscriptionPlan: {
    id: 'plan-1',
    name: 'Medium Fleet',
    price: 15000,
    maxVehicles: 20,
    features: ['Up to 20 vehicles', 'Advanced analytics', 'Priority support'],
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
  },
  walletBalance: 75000,
  reliabilityScore: 4.8,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export class FleetOperatorService {
  // Authentication
  static async loginFleetOperator(email: string, password: string): Promise<FleetOperatorUser> {
    if (email === 'fleet@example.com' && password === 'fleet123') {
      return mockFleetOperator;
    }
    throw new Error('Invalid credentials');
  }

  static async registerFleetOperator(data: FleetRegistrationData): Promise<FleetOperatorUser> {
    return Promise.resolve({
      id: 'fleet-new',
      email: data.email,
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone,
      address: data.address,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      role: 'fleet',
      kycStatus: 'pending',
      subscriptionPlan: {
        id: 'plan-1',
        name: 'Small Fleet',
        price: 5000,
        maxVehicles: 5,
        features: ['Up to 5 vehicles', 'Basic analytics'],
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
      },
      walletBalance: 0,
      reliabilityScore: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  }

  static async logoutFleetOperator(): Promise<void> {
    return Promise.resolve();
  }

  // Vehicle Management
  static async getVehicles(): Promise<VehicleDetails[]> {
    return Promise.resolve([
      {
        id: 'vehicle-1',
        registrationNumber: 'MH01AB1234',
        make: 'Tata',
        model: 'Ace',
        year: 2020,
        capacity: 1000,
        type: 'truck',
        status: 'available',
        currentLocation: { lat: 19.0760, lng: 72.8777 },
        vcode: 'V123456',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async addVehicle(vehicleData: Partial<VehicleDetails>): Promise<VehicleDetails> {
    return Promise.resolve({
      id: 'vehicle-new',
      registrationNumber: vehicleData.registrationNumber || '',
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      year: vehicleData.year || 2020,
      capacity: vehicleData.capacity || 0,
      type: vehicleData.type || 'truck',
      status: 'available',
      currentLocation: { lat: 19.0760, lng: 72.8777 },
      vcode: 'V' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
    });
  }

  static async updateVehicleStatus(vehicleId: string, status: string): Promise<void> {
    return Promise.resolve();
  }

  // Driver Management
  static async getDrivers(): Promise<DriverProfile[]> {
    return Promise.resolve([
      {
        id: 'driver-1',
        name: 'Raj Driver',
        phone: '+91-9876543210',
        licenseNumber: 'DL123456789',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        experience: 5,
        rating: 4.5,
        totalTrips: 150,
        isActive: true,
        vehicleId: 'vehicle-1',
        bankAccount: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
        },
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async addDriver(driverData: Partial<DriverProfile>): Promise<DriverProfile> {
    return Promise.resolve({
      id: 'driver-new',
      name: driverData.name || '',
      phone: driverData.phone || '',
      licenseNumber: driverData.licenseNumber || '',
      licenseExpiry: driverData.licenseExpiry || new Date().toISOString(),
      experience: driverData.experience || 0,
      rating: 0,
      totalTrips: 0,
      isActive: true,
      bankAccount: driverData.bankAccount || {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      },
      createdAt: new Date().toISOString(),
    });
  }

  static async assignDriverToVehicle(driverId: string, vehicleId: string): Promise<void> {
    return Promise.resolve();
  }

  // Shipment Offers
  static async getAvailableOffers(): Promise<ShipmentOffer[]> {
    return Promise.resolve([
      {
        id: 'offer-1',
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

  static async acceptOffer(offerId: string, vehicleId: string): Promise<void> {
    return Promise.resolve();
  }

  static async rejectOffer(offerId: string, reason: string): Promise<void> {
    return Promise.resolve();
  }

  // Wallet Management
  static async getWallet(): Promise<FleetWallet> {
    return Promise.resolve({
      balance: 75000,
      transactions: [
        {
          id: 'txn-1',
          type: 'credit',
          amount: 2500,
          description: 'Shipment payment',
          shipmentId: 'shipment-1',
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
      ],
      pendingAmount: 5000,
      totalEarnings: 250000,
      monthlyEarnings: 50000,
      commissionEarned: 12500,
    });
  }

  // Subscription Management
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Promise.resolve([
      {
        id: 'plan-1',
        name: 'Small Fleet',
        price: 5000,
        maxVehicles: 5,
        features: ['Up to 5 vehicles', 'Basic analytics'],
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
      },
      {
        id: 'plan-2',
        name: 'Medium Fleet',
        price: 15000,
        maxVehicles: 20,
        features: ['Up to 20 vehicles', 'Advanced analytics', 'Priority support'],
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
      },
    ]);
  }

  static async upgradeSubscription(planId: string): Promise<void> {
    return Promise.resolve();
  }

  // Analytics
  static async getAnalytics(): Promise<FleetAnalytics> {
    return Promise.resolve({
      totalVehicles: 15,
      activeVehicles: 12,
      totalDrivers: 18,
      activeDrivers: 15,
      totalTrips: 450,
      completedTrips: 420,
      totalEarnings: 250000,
      monthlyEarnings: 50000,
      averageRating: 4.8,
      performanceMetrics: {
        onTimeDelivery: 95,
        customerSatisfaction: 4.8,
        vehicleUtilization: 80,
        driverRetention: 90,
      },
    });
  }

  static async getKPIs(): Promise<FleetKPIs> {
    return Promise.resolve({
      vehicleUtilizationRate: 80,
      averageTripValue: 2500,
      driverRetentionRate: 90,
      customerSatisfactionScore: 4.8,
      monthlyGrowthRate: 20,
      costPerTrip: 500,
      revenuePerVehicle: 16667,
    });
  }

  static async getReliabilityScore(): Promise<ReliabilityScoreMetrics> {
    return Promise.resolve({
      onTimeDelivery: 95,
      customerRating: 4.8,
      cancellationRate: 2,
      damageRate: 1,
      responseTime: 5,
      overallScore: 4.8,
      lastUpdated: new Date().toISOString(),
    });
  }

  // KYC Management
  static async uploadKYCDocument(document: KYCDocument): Promise<void> {
    return Promise.resolve();
  }

  static async getKYCDocuments(): Promise<KYCDocument[]> {
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

  // Notifications
  static async getNotifications(): Promise<NotificationEvent[]> {
    return Promise.resolve([
      {
        id: 'notif-1',
        type: 'shipment',
        title: 'New Shipment Offer',
        message: 'A new shipment offer is available for your fleet',
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: '/offers',
      },
    ]);
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    return Promise.resolve();
  }
}
