import { ShipperUser, ShipmentDetails, AIPriceRecommendation, ShipperWallet, Invoice, Dispute, ShipperAnalytics, KYCDocument, ShipperRegistrationData, PriceAuditLog, NotificationEvent, ShipperKPIs } from '../types/shipper';

// Mock data for demonstration
const mockShipperUser: ShipperUser = {
  id: 'shipper-1',
  email: 'shipper@example.com',
  name: 'John Shipper',
  companyName: 'Shipper Co.',
  phone: '+91-9876543210',
  address: '123 Business St, Mumbai',
  gstNumber: 'GST123456789',
  panNumber: 'PAN123456789',
  role: 'shipper',
  kycStatus: 'verified',
  walletBalance: 50000,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export class ShipperService {
  // Authentication
  static async loginShipper(email: string, password: string): Promise<ShipperUser> {
    // Mock authentication
    if (email === 'shipper@example.com' && password === 'shipper123') {
      return mockShipperUser;
    }
    throw new Error('Invalid credentials');
  }

  static async registerShipper(data: ShipperRegistrationData): Promise<ShipperUser> {
    // Mock registration
    return Promise.resolve({
      id: 'shipper-new',
      email: data.email,
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      address: data.address,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      role: 'shipper',
      kycStatus: 'pending',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
  }

  static async logoutShipper(): Promise<void> {
    return Promise.resolve();
  }

  // Shipment Management
  static async createShipment(shipmentData: Partial<ShipmentDetails>): Promise<ShipmentDetails> {
    return Promise.resolve({
      id: 'shipment-new',
      pickupAddress: shipmentData.pickupAddress || '',
      deliveryAddress: shipmentData.deliveryAddress || '',
      pickupDate: shipmentData.pickupDate || new Date().toISOString(),
      deliveryDate: shipmentData.deliveryDate || new Date().toISOString(),
      weight: shipmentData.weight || 0,
      dimensions: shipmentData.dimensions || { length: 0, width: 0, height: 0 },
      value: shipmentData.value || 0,
      description: shipmentData.description || '',
      status: 'pending',
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
    });
  }

  static async getShipments(): Promise<ShipmentDetails[]> {
    return Promise.resolve([
      {
        id: 'shipment-1',
        pickupAddress: 'Mumbai, Maharashtra',
        deliveryAddress: 'Delhi, Delhi',
        pickupDate: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 50,
        dimensions: { length: 100, width: 50, height: 30 },
        value: 10000,
        description: 'Electronics shipment',
        status: 'in_transit',
        trackingNumber: 'TRK123456789',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async getShipmentById(shipmentId: string): Promise<ShipmentDetails> {
    return Promise.resolve({
      id: shipmentId,
      pickupAddress: 'Mumbai, Maharashtra',
      deliveryAddress: 'Delhi, Delhi',
      pickupDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 50,
      dimensions: { length: 100, width: 50, height: 30 },
      value: 10000,
      description: 'Electronics shipment',
      status: 'in_transit',
      trackingNumber: 'TRK123456789',
      createdAt: new Date().toISOString(),
    });
  }

  // AI Price Validation
  static async getPriceRecommendation(shipmentData: Partial<ShipmentDetails>): Promise<AIPriceRecommendation> {
    return Promise.resolve({
      suggestedPrice: 2500,
      confidence: 0.85,
      factors: {
        distance: 1200,
        weight: 50,
        demand: 0.7,
        fuelCost: 0.3,
        marketRate: 0.8,
      },
      alternatives: [
        {
          price: 2000,
          reason: 'Lower price for regular customer',
        },
        {
          price: 3000,
          reason: 'Premium service with insurance',
        },
      ],
    });
  }

  // Wallet Management
  static async getWallet(): Promise<ShipperWallet> {
    return Promise.resolve({
      balance: 50000,
      transactions: [
        {
          id: 'txn-1',
          type: 'debit',
          amount: 2500,
          description: 'Shipment payment',
          shipmentId: 'shipment-1',
          timestamp: new Date().toISOString(),
          status: 'completed',
        },
      ],
      pendingAmount: 0,
      totalSpent: 125000,
      monthlySpend: 25000,
    });
  }

  static async addFunds(amount: number): Promise<void> {
    // Mock add funds
    return Promise.resolve();
  }

  // Invoice Management
  static async getInvoices(): Promise<Invoice[]> {
    return Promise.resolve([
      {
        id: 'invoice-1',
        shipmentId: 'shipment-1',
        amount: 2500,
        tax: 450,
        total: 2950,
        status: 'paid',
        dueDate: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // Dispute Management
  static async getDisputes(): Promise<Dispute[]> {
    return Promise.resolve([
      {
        id: 'dispute-1',
        shipmentId: 'shipment-1',
        type: 'delivery',
        description: 'Package was damaged during delivery',
        status: 'open',
        evidence: ['photo1.jpg', 'photo2.jpg'],
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  static async createDispute(disputeData: Partial<Dispute>): Promise<Dispute> {
    return Promise.resolve({
      id: 'dispute-new',
      shipmentId: disputeData.shipmentId || '',
      type: disputeData.type || 'delivery',
      description: disputeData.description || '',
      status: 'open',
      evidence: disputeData.evidence || [],
      createdAt: new Date().toISOString(),
    });
  }

  // Analytics
  static async getAnalytics(): Promise<ShipperAnalytics> {
    return Promise.resolve({
      totalShipments: 150,
      completedShipments: 140,
      cancelledShipments: 10,
      averageRating: 4.5,
      totalSpent: 125000,
      monthlySpend: 25000,
      favoriteRoutes: [
        { route: 'Mumbai to Delhi', count: 45 },
        { route: 'Mumbai to Bangalore', count: 30 },
      ],
      performanceMetrics: {
        onTimeDelivery: 95,
        customerSatisfaction: 4.5,
        costEfficiency: 88,
      },
    });
  }

  static async getKPIs(): Promise<ShipperKPIs> {
    return Promise.resolve({
      deliverySuccessRate: 95,
      averageDeliveryTime: 2.5,
      customerSatisfactionScore: 4.5,
      costPerShipment: 2500,
      monthlyGrowthRate: 15,
      disputeResolutionTime: 24,
    });
  }

  // KYC Management
  static async uploadKYCDocument(document: KYCDocument): Promise<void> {
    // Mock document upload
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
        title: 'Shipment Delivered',
        message: 'Your shipment TRK123456789 has been delivered successfully',
        isRead: false,
        timestamp: new Date().toISOString(),
        actionUrl: '/shipments/TRK123456789',
      },
    ]);
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    // Mock mark as read
    return Promise.resolve();
  }

  // Price Audit
  static async getPriceAuditLog(): Promise<PriceAuditLog[]> {
    return Promise.resolve([
      {
        id: 'audit-1',
        shipmentId: 'shipment-1',
        originalPrice: 2000,
        suggestedPrice: 2500,
        finalPrice: 2500,
        aiConfidence: 0.85,
        factors: {},
        timestamp: new Date().toISOString(),
      },
    ]);
  }
}
