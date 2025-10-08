// Database context types
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number: string;
  pan_number: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  company_id: string;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  driver_name: string;
  driver_phone: string;
  status: 'available' | 'busy' | 'maintenance';
  location: {
    lat: number;
    lng: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  shipper_id: string;
  vehicle_id?: string;
  pickup_address: string;
  delivery_address: string;
  pickup_location: {
    lat: number;
    lng: number;
  };
  delivery_location: {
    lat: number;
    lng: number;
  };
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

export interface Analytics {
  total_shipments: number;
  completed_shipments: number;
  pending_shipments: number;
  total_revenue: number;
  average_delivery_time: number;
  customer_satisfaction: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  shipment_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationUpdate {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}
