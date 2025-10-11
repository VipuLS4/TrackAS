// Customer Role Types
export interface CustomerTrackingData {
  shipmentId: string;
  trackingNumber: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  route: {
    lat: number;
    lng: number;
  }[];
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
  updates: TrackingUpdate[];
  pod?: ProofOfDelivery;
}

export interface TrackingUpdate {
  id: string;
  status: string;
  message: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
}

export interface ProofOfDelivery {
  id: string;
  deliveredAt: string;
  receivedBy: string;
  signature: string;
  photo: string;
  notes?: string;
}

export interface TrackingPageError {
  code: 'INVALID_TOKEN' | 'SHIPMENT_NOT_FOUND' | 'EXPIRED_TOKEN' | 'SYSTEM_ERROR';
  message: string;
  details?: string;
}

export interface CustomerFeedback {
  shipmentId: string;
  rating: number;
  comment: string;
  categories: {
    delivery: number;
    communication: number;
    packaging: number;
    timeliness: number;
  };
  submittedAt: string;
}

export interface TrackingTokenPayload {
  shipmentId: string;
  expiresAt: string;
  permissions: string[];
}
