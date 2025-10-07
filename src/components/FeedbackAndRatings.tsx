import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Package, 
  Truck, 
  User, 
  CheckCircle, 
  AlertCircle,
  Send,
  Camera,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RatingData {
  shipmentId: string;
  raterId: string;
  ratedEntityId: string;
  ratedEntityType: 'driver' | 'fleet' | 'shipper';
  stars: number;
  comments: string;
  structuredFeedback: {
    timeliness: number;
    communication: number;
    condition: number;
    professionalism: number;
    overall: number;
  };
}

interface ShipmentForRating {
  id: string;
  pickupLocation: { address: string };
  dropLocation: { address: string };
  consignmentDetails: { items: string };
  status: string;
  deliveredAt: string;
  assignedDriver?: {
    name: string;
    phone: string;
  };
  assignedFleet?: {
    name: string;
    contact: string;
  };
  shipper?: {
    name: string;
    email: string;
  };
}

const FeedbackAndRatings: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentForRating[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentForRating | null>(null);
  const [ratingData, setRatingData] = useState<RatingData>({
    shipmentId: '',
    raterId: '',
    ratedEntityId: '',
    ratedEntityType: 'driver',
    stars: 0,
    comments: '',
    structuredFeedback: {
      timeliness: 0,
      communication: 0,
      condition: 0,
      professionalism: 0,
      overall: 0
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRatings, setSubmittedRatings] = useState<string[]>([]);

  // Mock data for development
  useEffect(() => {
    const mockShipments: ShipmentForRating[] = [
      {
        id: 'SHIP-001',
        pickupLocation: { address: '123 Industrial Area, Delhi' },
        dropLocation: { address: '456 Business Park, Mumbai' },
        consignmentDetails: { items: 'Electronics Components' },
        status: 'DELIVERED',
        deliveredAt: '2024-01-15T16:30:00Z',
        assignedDriver: {
          name: 'Rajesh Kumar',
          phone: '+91-9876543210'
        },
        assignedFleet: {
          name: 'ABC Transport Ltd',
          contact: '+91-9876543211'
        },
        shipper: {
          name: 'Tech Solutions Pvt Ltd',
          email: 'shipping@techsolutions.com'
        }
      },
      {
        id: 'SHIP-002',
        pickupLocation: { address: '789 Warehouse, Bangalore' },
        dropLocation: { address: '321 Factory, Chennai' },
        consignmentDetails: { items: 'Textile Materials' },
        status: 'DELIVERED',
        deliveredAt: '2024-01-14T14:20:00Z',
        assignedDriver: {
          name: 'Suresh Patel',
          phone: '+91-9876543212'
        },
        assignedFleet: {
          name: 'XYZ Logistics',
          contact: '+91-9876543213'
        },
        shipper: {
          name: 'Fashion Forward Ltd',
          email: 'logistics@fashionforward.com'
        }
      }
    ];
    
    setShipments(mockShipments);
  }, []);

  const handleShipmentSelect = (shipment: ShipmentForRating) => {
    setSelectedShipment(shipment);
    setRatingData(prev => ({
      ...prev,
      shipmentId: shipment.id,
      ratedEntityId: shipment.assignedDriver?.name || shipment.assignedFleet?.name || '',
      ratedEntityType: shipment.assignedDriver ? 'driver' : 'fleet'
    }));
  };

  const handleStarRating = (stars: number) => {
    setRatingData(prev => ({ ...prev, stars }));
  };

  const handleStructuredRating = (field: keyof typeof ratingData.structuredFeedback, value: number) => {
    setRatingData(prev => ({
      ...prev,
      structuredFeedback: {
        ...prev.structuredFeedback,
        [field]: value
      }
    }));
  };

  const handleCommentsChange = (comments: string) => {
    setRatingData(prev => ({ ...prev, comments }));
  };

  const handleSubmitRating = async () => {
    if (!selectedShipment || ratingData.stars === 0) {
      alert('Please provide a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to submitted ratings
      setSubmittedRatings(prev => [...prev, selectedShipment.id]);

      // Reset form
      setRatingData(prev => ({
        ...prev,
        stars: 0,
        comments: '',
        structuredFeedback: {
          timeliness: 0,
          communication: 0,
          condition: 0,
          professionalism: 0,
          overall: 0
        }
      }));

      alert('Rating submitted successfully!');
    } catch (error) {
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Ratings</h1>
        <p className="text-gray-600">Rate your delivery experience and help improve our service</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Completed Shipments</h2>
            <p className="text-sm text-gray-600 mt-1">Select a shipment to provide feedback</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <div
                key={shipment.id}
                className={`p-6 cursor-pointer transition-colors ${
                  selectedShipment?.id === shipment.id 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleShipmentSelect(shipment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{shipment.id}</span>
                      {submittedRatings.includes(shipment.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Truck className="h-3 w-3" />
                        <span>{shipment.pickupLocation.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3" />
                        <span>{shipment.dropLocation.address}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Delivered: {formatDate(shipment.deliveredAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <User className="h-3 w-3" />
                        <span>Driver: {shipment.assignedDriver?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status}
                    </div>
                    {submittedRatings.includes(shipment.id) && (
                      <div className="text-xs text-green-600 mt-1">Rated</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rate Your Experience</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedShipment ? `Rating for ${selectedShipment.id}` : 'Select a shipment to rate'}
            </p>
          </div>

          {selectedShipment ? (
            <div className="p-6 space-y-6">
              {/* Shipment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Shipment Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Items:</strong> {selectedShipment.consignmentDetails.items}</div>
                  <div><strong>Driver:</strong> {selectedShipment.assignedDriver?.name}</div>
                  <div><strong>Fleet:</strong> {selectedShipment.assignedFleet?.name}</div>
                  <div><strong>Delivered:</strong> {formatDate(selectedShipment.deliveredAt)}</div>
                </div>
              </div>

              {/* Overall Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Overall Rating *
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleStarRating(star)}
                      className={`p-1 ${
                        star <= ratingData.stars 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {ratingData.stars > 0 ? getRatingLabel(ratingData.stars) : 'Click to rate'}
                </p>
              </div>

              {/* Structured Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Detailed Feedback
                </label>
                <div className="space-y-4">
                  {[
                    { key: 'timeliness', label: 'Timeliness', icon: Clock },
                    { key: 'communication', label: 'Communication', icon: MessageSquare },
                    { key: 'condition', label: 'Package Condition', icon: Package },
                    { key: 'professionalism', label: 'Professionalism', icon: User }
                  ].map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center space-x-2 mb-2">
                        <item.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => handleStructuredRating(item.key as keyof typeof ratingData.structuredFeedback, value)}
                            className={`p-1 ${
                              value <= ratingData.structuredFeedback[item.key as keyof typeof ratingData.structuredFeedback]
                                ? 'text-yellow-400' 
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          >
                            <Star className="h-5 w-5 fill-current" />
                          </button>
                        ))}
                        <span className="text-xs text-gray-500 ml-2">
                          {ratingData.structuredFeedback[item.key as keyof typeof ratingData.structuredFeedback] > 0 
                            ? getRatingLabel(ratingData.structuredFeedback[item.key as keyof typeof ratingData.structuredFeedback])
                            : 'Not rated'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={ratingData.comments}
                  onChange={(e) => handleCommentsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Share your experience, suggestions, or any specific feedback..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitRating}
                disabled={isSubmitting || ratingData.stars === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Rating'}</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a shipment from the list to provide feedback</p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Guidelines */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">Rating Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">⭐ Excellent (5 stars)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Delivered on time or earlier</li>
              <li>Package in perfect condition</li>
              <li>Excellent communication</li>
              <li>Professional and courteous</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">👍 Good (4 stars)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Delivered within expected time</li>
              <li>Package in good condition</li>
              <li>Good communication</li>
              <li>Professional service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">👌 Fair (3 stars)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Minor delays or issues</li>
              <li>Package condition acceptable</li>
              <li>Adequate communication</li>
              <li>Service met basic expectations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">👎 Poor (1-2 stars)</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Significant delays or problems</li>
              <li>Package damaged or issues</li>
              <li>Poor communication</li>
              <li>Unprofessional behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAndRatings;
