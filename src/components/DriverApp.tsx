import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Package, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Upload,
  Signature,
  Truck,
  Route,
  Zap,
  Shield,
  Star,
  MessageSquare,
  Download
} from 'lucide-react';

interface ShipmentDetails {
  id: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
    contactPerson: string;
    contactPhone: string;
  };
  dropLocation: {
    address: string;
    lat: number;
    lng: number;
    contactPerson: string;
    contactPhone: string;
  };
  consignmentDetails: {
    items: string;
    weight: string;
    volume: string;
    description: string;
  };
  customerInfo: {
    receiverName: string;
    receiverPhone: string;
    receiverEmail: string;
    specialInstructions: string;
  };
  status: 'ASSIGNED' | 'PICKUP_ARRIVED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  assignedAt: string;
  preferredPickupWindow: { start: string; end: string };
  preferredDeliveryWindow: { start: string; end: string };
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

const DriverApp: React.FC = () => {
  const [currentShipment, setCurrentShipment] = useState<ShipmentDetails | null>(null);
  const [currentStep, setCurrentStep] = useState<'pickup' | 'transit' | 'delivery'>('pickup');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [arrivedAtPickup, setArrivedAtPickup] = useState(false);
  const [arrivedAtDelivery, setArrivedAtDelivery] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);

  // Mock shipment data
  useEffect(() => {
    const mockShipment: ShipmentDetails = {
      id: 'SHIP-001',
      pickupLocation: {
        address: '123 Industrial Area, Delhi',
        lat: 28.6139,
        lng: 77.2090,
        contactPerson: 'Rajesh Kumar',
        contactPhone: '+91-9876543210'
      },
      dropLocation: {
        address: '456 Business Park, Mumbai',
        lat: 19.0760,
        lng: 72.8777,
        contactPerson: 'Priya Sharma',
        contactPhone: '+91-9876543211'
      },
      consignmentDetails: {
        items: 'Electronics Components',
        weight: '150',
        volume: '2.5',
        description: 'Fragile items - handle with care'
      },
      customerInfo: {
        receiverName: 'Priya Sharma',
        receiverPhone: '+91-9876543211',
        receiverEmail: 'priya@company.com',
        specialInstructions: 'Deliver to reception desk'
      },
      status: 'ASSIGNED',
      assignedAt: '2024-01-15T10:00:00Z',
      preferredPickupWindow: { start: '09:00', end: '12:00' },
      preferredDeliveryWindow: { start: '14:00', end: '18:00' }
    };
    
    setCurrentShipment(mockShipment);
  }, []);

  // Mock location tracking
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate location updates
      setCurrentLocation({
        lat: 28.6139 + (Math.random() - 0.5) * 0.01,
        lng: 77.2090 + (Math.random() - 0.5) * 0.01,
        accuracy: 10,
        timestamp: new Date().toISOString()
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    // In production, this would integrate with Google Maps or similar
    console.log('Starting navigation to pickup location');
  };

  const handleArrivedAtPickup = async () => {
    if (!currentShipment || !currentLocation) return;

    // Check if driver is within geofence (100m radius)
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      currentShipment.pickupLocation.lat,
      currentShipment.pickupLocation.lng
    );

    if (distance > 0.1) { // 100m
      alert('You are not at the pickup location. Please move closer.');
      return;
    }

    setArrivedAtPickup(true);
    // Update shipment status
    console.log('Driver arrived at pickup location');
  };

  const handlePickupConfirmed = async () => {
    if (!currentShipment) return;

    // Validate required documents
    if (!uploadedDocuments.preLoadPhoto) {
      alert('Please upload pre-load photo');
      return;
    }

    setIsUploading(true);
    try {
      // Upload documents
      await uploadDocuments();
      
      // Update shipment status
      setCurrentShipment(prev => prev ? { ...prev, status: 'PICKED_UP' } : null);
      setCurrentStep('transit');
      
      // Notify shipper and customer
      console.log('Pickup confirmed, shipment in transit');
      
    } catch (error) {
      alert('Failed to confirm pickup. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleArrivedAtDelivery = async () => {
    if (!currentShipment || !currentLocation) return;

    // Check if driver is within geofence
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      currentShipment.dropLocation.lat,
      currentShipment.dropLocation.lng
    );

    if (distance > 0.1) { // 100m
      alert('You are not at the delivery location. Please move closer.');
      return;
    }

    setArrivedAtDelivery(true);
    console.log('Driver arrived at delivery location');
  };

  const handleDeliveryConfirmed = async () => {
    if (!currentShipment) return;

    // Validate required documents
    if (!uploadedDocuments.podPhoto || !uploadedDocuments.signature) {
      alert('Please upload POD photo and customer signature');
      return;
    }

    setIsUploading(true);
    try {
      // Upload documents
      await uploadDocuments();
      
      // Update shipment status
      setCurrentShipment(prev => prev ? { ...prev, status: 'DELIVERED' } : null);
      
      // Trigger payment settlement
      console.log('Delivery confirmed, triggering payment settlement');
      
    } catch (error) {
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadDocuments = async () => {
    // Simulate document upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Documents uploaded successfully');
  };

  const handleFileUpload = (docType: string, file: File) => {
    setUploadedDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI/180);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentShipment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No active shipment assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Shipment ID: {currentShipment.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentShipment.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
              currentShipment.status === 'PICKUP_ARRIVED' ? 'bg-yellow-100 text-yellow-800' :
              currentShipment.status === 'PICKED_UP' ? 'bg-green-100 text-green-800' :
              currentShipment.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
              'bg-green-100 text-green-800'
            }`}>
              {currentShipment.status.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current Location</span>
            </div>
            <div className="text-sm text-blue-600">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[
            { key: 'pickup', label: 'Pickup', icon: Package },
            { key: 'transit', label: 'Transit', icon: Route },
            { key: 'delivery', label: 'Delivery', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep === step.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === step.key ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
              {index < 2 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep === 'transit' || currentStep === 'delivery' ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Step */}
      {currentStep === 'pickup' && (
        <div className="space-y-6">
          {/* Pickup Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{currentShipment.pickupLocation.address}</p>
                    <p className="text-sm text-gray-600">Contact: {currentShipment.pickupLocation.contactPerson}</p>
                    <p className="text-sm text-gray-600">Phone: {currentShipment.pickupLocation.contactPhone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Pickup Window</p>
                    <p className="text-sm text-gray-600">
                      {currentShipment.preferredPickupWindow.start} - {currentShipment.preferredPickupWindow.end}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consignment Details */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Consignment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Items:</span>
                  <p className="font-medium">{currentShipment.consignmentDetails.items}</p>
                </div>
                <div>
                  <span className="text-gray-600">Weight:</span>
                  <p className="font-medium">{currentShipment.consignmentDetails.weight} kg</p>
                </div>
                <div>
                  <span className="text-gray-600">Volume:</span>
                  <p className="font-medium">{currentShipment.consignmentDetails.volume} cbm</p>
                </div>
              </div>
              {currentShipment.consignmentDetails.description && (
                <div className="mt-2">
                  <span className="text-gray-600">Description:</span>
                  <p className="text-sm text-gray-800">{currentShipment.consignmentDetails.description}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-4">
              {!isNavigating ? (
                <button
                  onClick={handleStartNavigation}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Start Navigation</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Navigation className="h-4 w-4 animate-pulse" />
                  <span>Navigating...</span>
                </div>
              )}

              {isNavigating && !arrivedAtPickup && (
                <button
                  onClick={handleArrivedAtPickup}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>I've Arrived</span>
                </button>
              )}
            </div>

            {/* Arrival Confirmation */}
            {arrivedAtPickup && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Arrived at Pickup Location</span>
                </div>
                
                {/* Document Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-load Photo (Required)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('preLoadPhoto', file);
                        }}
                        className="hidden"
                        id="preLoadPhoto"
                      />
                      <label htmlFor="preLoadPhoto" className="cursor-pointer">
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploadedDocuments.preLoadPhoto ? uploadedDocuments.preLoadPhoto.name : 'Click to upload pre-load photo'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handlePickupConfirmed}
                    disabled={isUploading || !uploadedDocuments.preLoadPhoto}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{isUploading ? 'Confirming...' : 'Confirm Pickup'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transit Step */}
      {currentStep === 'transit' && (
        <div className="space-y-6">
          {/* Transit Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">In Transit</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Location</h4>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{currentShipment.dropLocation.address}</p>
                    <p className="text-sm text-gray-600">Contact: {currentShipment.dropLocation.contactPerson}</p>
                    <p className="text-sm text-gray-600">Phone: {currentShipment.dropLocation.contactPhone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Delivery Window</h4>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentShipment.preferredDeliveryWindow.start} - {currentShipment.preferredDeliveryWindow.end}
                    </p>
                    <p className="text-sm text-gray-600">Preferred delivery time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ETA and Distance */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="text-lg font-semibold text-blue-800">2h 30m</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Route className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Distance Remaining</p>
                  <p className="text-lg font-semibold text-green-800">145 km</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setCurrentStep('delivery')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>I've Arrived at Delivery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Step */}
      {currentStep === 'delivery' && (
        <div className="space-y-6">
          {/* Delivery Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{currentShipment.dropLocation.address}</p>
                    <p className="text-sm text-gray-600">Contact: {currentShipment.dropLocation.contactPerson}</p>
                    <p className="text-sm text-gray-600">Phone: {currentShipment.dropLocation.contactPhone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Receiver Details</p>
                    <p className="text-sm text-gray-600">Name: {currentShipment.customerInfo.receiverName}</p>
                    <p className="text-sm text-gray-600">Phone: {currentShipment.customerInfo.receiverPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {currentShipment.customerInfo.specialInstructions && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                <p className="text-sm text-gray-600">{currentShipment.customerInfo.specialInstructions}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex space-x-4">
              {!arrivedAtDelivery && (
                <button
                  onClick={handleArrivedAtDelivery}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>I've Arrived</span>
                </button>
              )}
            </div>

            {/* Delivery Confirmation */}
            {arrivedAtDelivery && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Arrived at Delivery Location</span>
                </div>
                
                {/* Document Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      POD Photo (Required)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('podPhoto', file);
                        }}
                        className="hidden"
                        id="podPhoto"
                      />
                      <label htmlFor="podPhoto" className="cursor-pointer">
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploadedDocuments.podPhoto ? uploadedDocuments.podPhoto.name : 'Click to upload POD photo'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Signature (Required)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('signature', file);
                        }}
                        className="hidden"
                        id="signature"
                      />
                      <label htmlFor="signature" className="cursor-pointer">
                        <div className="text-center">
                          <Signature className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploadedDocuments.signature ? uploadedDocuments.signature.name : 'Click to upload signature'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleDeliveryConfirmed}
                    disabled={isUploading || !uploadedDocuments.podPhoto || !uploadedDocuments.signature}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>{isUploading ? 'Confirming...' : 'Confirm Delivery'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverApp;
