import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Truck, 
  Clock, 
  CheckCircle, 
  Phone, 
  Star, 
  MessageSquare, 
  Camera, 
  Shield, 
  Eye, 
  EyeOff, 
  Navigation, 
  Package, 
  User, 
  Calendar, 
  AlertCircle, 
  RefreshCw,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';

interface ShipmentDetails {
  id: string;
  shipperName: string;
  consignmentDetails: {
    items: string;
    weight: number;
    volume: number;
    description: string;
  };
  pickupLocation: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  deliveryLocation: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  status: string;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  eta?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface DriverInfo {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  photo?: string;
}

interface StatusTimeline {
  status: string;
  timestamp: string;
  location?: string;
  description: string;
  completed: boolean;
}

interface PODDetails {
  images: string[];
  signature: string;
  deliveryTime: string;
  notes?: string;
}

interface FeedbackData {
  rating: number;
  comments: string;
  categories: {
    timeliness: number;
    communication: number;
    handling: number;
    overall: number;
  };
}

const CustomerTrackingPortal: React.FC = () => {
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails | null>(null);
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [statusTimeline, setStatusTimeline] = useState<StatusTimeline[]>([]);
  const [podDetails, setPodDetails] = useState<PODDetails | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    rating: 0,
    comments: '',
    categories: {
      timeliness: 0,
      communication: 0,
      handling: 0,
      overall: 0
    }
  });
  const [showDriverPhone, setShowDriverPhone] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Get tracking token from URL
  const trackingToken = new URLSearchParams(window.location.search).get('token');

  useEffect(() => {
    if (trackingToken) {
      loadTrackingData(trackingToken);
    } else {
      setError('Invalid tracking link. Please check your tracking URL.');
      setLoading(false);
    }
  }, [trackingToken]);

  const loadTrackingData = async (token: string) => {
    setLoading(true);
    try {
      // Simulate API call with token validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      const mockShipment: ShipmentDetails = {
        id: 'SHIP-001',
        shipperName: 'XYZ Manufacturing Ltd',
        consignmentDetails: {
          items: 'Electronics Components',
          weight: 500,
          volume: 2.5,
          description: 'High-quality electronic components for manufacturing'
        },
        pickupLocation: {
          address: '123 Industrial Area, Sector 18',
          city: 'Mumbai',
          state: 'Maharashtra',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        deliveryLocation: {
          address: '456 Business Park, Connaught Place',
          city: 'Delhi',
          state: 'Delhi',
          coordinates: { lat: 28.6139, lng: 77.2090 }
        },
        status: 'IN_TRANSIT',
        currentLocation: {
          lat: 19.4326,
          lng: 72.8356,
          address: 'Near Vadodara, Gujarat'
        },
        eta: '2 hours 30 minutes',
        createdAt: '2024-01-15T06:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      };

      const mockDriver: DriverInfo = {
        name: 'Amit Singh',
        phone: '+91 98765 43210',
        vehicleType: 'Truck',
        vehicleNumber: 'MH-01-AB-1234',
        rating: 4.8,
        photo: '/api/placeholder/100/100'
      };

      const mockTimeline: StatusTimeline[] = [
        {
          status: 'CREATED',
          timestamp: '2024-01-15T06:00:00Z',
          description: 'Shipment created by shipper',
          completed: true
        },
        {
          status: 'ASSIGNED',
          timestamp: '2024-01-15T08:30:00Z',
          description: 'Assigned to fleet operator',
          completed: true
        },
        {
          status: 'PICKED_UP',
          timestamp: '2024-01-15T10:15:00Z',
          location: 'Mumbai, Maharashtra',
          description: 'Package picked up from shipper',
          completed: true
        },
        {
          status: 'IN_TRANSIT',
          timestamp: '2024-01-15T10:30:00Z',
          location: 'En route to Delhi',
          description: 'Package in transit',
          completed: true
        },
        {
          status: 'DELIVERED',
          timestamp: '',
          description: 'Package delivered to recipient',
          completed: false
        }
      ];

      setShipmentDetails(mockShipment);
      setDriverInfo(mockDriver);
      setStatusTimeline(mockTimeline);

      // Load POD details if delivered
      if (mockShipment.status === 'DELIVERED') {
        const mockPOD: PODDetails = {
          images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          signature: '/api/placeholder/300/150',
          deliveryTime: '2024-01-15T16:45:00Z',
          notes: 'Package delivered in good condition'
        };
        setPodDetails(mockPOD);
      }

    } catch (error) {
      console.error('Error loading tracking data:', error);
      setError('Failed to load tracking information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeedbackSubmitted(true);
      alert('Thank you for your feedback! Your response has been recorded.');
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleCallDriver = () => {
    if (driverInfo) {
      window.open(`tel:${driverInfo.phone}`);
    }
  };

  const handleShareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Track Your Shipment',
        text: `Track your shipment ${shipmentDetails?.id}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tracking link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP': return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <Package className="h-5 w-5" />;
      case 'ASSIGNED': return <User className="h-5 w-5" />;
      case 'PICKED_UP': return <Truck className="h-5 w-5" />;
      case 'IN_TRANSIT': return <Navigation className="h-5 w-5" />;
      case 'DELIVERED': return <CheckCircle className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const maskPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '+91 $2***$4');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Tracking Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!shipmentDetails || !driverInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No tracking information found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Shipment</h1>
              <p className="text-gray-600">Shipment ID: {shipmentDetails.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShareTracking}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Share Tracking Link"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-900"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Shipment Overview Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {shipmentDetails.consignmentDetails.items}
              </h2>
              <p className="text-gray-600 mb-1">
                From: {shipmentDetails.pickupLocation.city}, {shipmentDetails.pickupLocation.state}
              </p>
              <p className="text-gray-600">
                To: {shipmentDetails.deliveryLocation.city}, {shipmentDetails.deliveryLocation.state}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipmentDetails.status)}`}>
                {shipmentDetails.status.replace('_', ' ')}
              </span>
              {shipmentDetails.eta && (
                <p className="text-sm text-gray-600 mt-2">
                  ETA: {shipmentDetails.eta}
                </p>
              )}
            </div>
          </div>

          {/* Current Location */}
          {shipmentDetails.currentLocation && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Current Location</p>
                  <p className="text-sm text-blue-700">{shipmentDetails.currentLocation.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Package Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium ml-2">{shipmentDetails.consignmentDetails.weight} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium ml-2">{shipmentDetails.consignmentDetails.volume} m³</span>
            </div>
            <div>
              <span className="text-gray-600">Shipper:</span>
              <span className="font-medium ml-2">{shipmentDetails.shipperName}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'tracking', label: 'Live Tracking', icon: MapPin },
                { id: 'timeline', label: 'Status Timeline', icon: Clock },
                { id: 'driver', label: 'Driver Info', icon: User },
                { id: 'delivery', label: 'Delivery', icon: CheckCircle },
                { id: 'feedback', label: 'Feedback', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Live Map */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Tracking Map</h3>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Interactive map would be displayed here</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Current location: {shipmentDetails.currentLocation?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Pickup Location</p>
                    <p className="text-sm text-gray-600">{shipmentDetails.pickupLocation.address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Current Location</p>
                    <p className="text-sm text-gray-600">{shipmentDetails.currentLocation?.address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery Location</p>
                    <p className="text-sm text-gray-600">{shipmentDetails.deliveryLocation.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Status Timeline</h3>
            <div className="space-y-4">
              {statusTimeline.map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {item.status.replace('_', ' ')}
                      </h4>
                      {item.timestamp && (
                        <span className="text-sm text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'driver' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Driver Information</h3>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">{driverInfo.name}</h4>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">{driverInfo.rating} rating</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {driverInfo.vehicleType} - {driverInfo.vehicleNumber}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {showDriverPhone ? driverInfo.phone : maskPhoneNumber(driverInfo.phone)}
                    </span>
                    <button
                      onClick={() => setShowDriverPhone(!showDriverPhone)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      {showDriverPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleCallDriver}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Driver</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            {podDetails ? (
              <>
                {/* Delivery Confirmation */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Confirmation</h3>
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    <span className="text-green-600 font-medium">Package Delivered Successfully</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Delivered on {formatDate(podDetails.deliveryTime)}
                  </p>
                  {podDetails.notes && (
                    <p className="text-gray-600 mb-4">{podDetails.notes}</p>
                  )}
                </div>

                {/* POD Images */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Delivery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {podDetails.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg p-4">
                        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          Delivery Photo {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="bg-gray-200 rounded-lg h-24 flex items-center justify-center">
                        <span className="text-gray-600">Signature</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 text-center">Customer Signature</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Not Yet Delivered</h3>
                  <p className="text-gray-600">
                    Your package is still in transit. Delivery confirmation and proof of delivery will be available here once the package is delivered.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {feedbackSubmitted ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">
                  Your feedback has been submitted successfully. We appreciate your input!
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Delivery Feedback</h3>
                <div className="space-y-6">
                  {/* Overall Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                          className={`p-1 ${star <= feedbackData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          <Star className="h-6 w-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Rate Your Experience
                    </label>
                    <div className="space-y-4">
                      {Object.entries(feedbackData.categories).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFeedbackData(prev => ({
                                  ...prev,
                                  categories: { ...prev.categories, [category]: star }
                                }))}
                                className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                              >
                                <Star className="h-4 w-4 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={feedbackData.comments}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, comments: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Share your experience with this delivery..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackData.rating === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure tracking powered by TrackAS</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Need help? Contact support</span>
              <button className="text-blue-600 hover:text-blue-800">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackingPortal;