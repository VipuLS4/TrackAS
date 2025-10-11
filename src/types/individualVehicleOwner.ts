// Individual Vehicle Owner Role Types
export interface IndividualVehicleOwnerUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  panNumber: string;
  role: 'individual';
  kycStatus: 'pending' | 'verified' | 'rejected';
  walletBalance: number;
  reliabilityScore: number;
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  lastLogin: string;
}

export interface IVOTripDetails {
  id: string;
  shipmentId: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  value: number;
  offeredPrice: number;
  distance: number;
  status: 'available' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  customerRating?: number;
  customerFeedback?: string;
  createdAt: string;
  completedAt?: string;
}

export interface IVOWallet {
  balance: number;
  transactions: WalletTransaction[];
  pendingAmount: number;
  totalEarnings: number;
  monthlyEarnings: number;
  commissionPaid: number;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  shipmentId?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface IVOTripHistory {
  id: string;
  shipmentId: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  weight: number;
  value: number;
  earnedAmount: number;
  distance: number;
  duration: number;
  customerRating: number;
  customerFeedback: string;
  status: 'completed' | 'cancelled';
  completedAt: string;
}

export interface IVODocument {
  id: string;
  type: 'pan' | 'license' | 'vehicle' | 'address' | 'bank';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
}

export interface IVOPerformance {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  reliabilityScore: number;
  onTimeDelivery: number;
  customerSatisfaction: number;
  lastUpdated: string;
}

export interface IVORegistrationData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  panNumber: string;
  vehicleDetails: {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    type: 'truck' | 'van' | 'car' | 'bike';
  };
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  documents: IVODocument[];
}

export interface IVOKPIs {
  tripCompletionRate: number;
  averageTripValue: number;
  customerSatisfactionScore: number;
  monthlyGrowthRate: number;
  costPerTrip: number;
  earningsPerTrip: number;
  onlineTimePercentage: number;
}
