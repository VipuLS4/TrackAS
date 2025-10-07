import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  Truck, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Navigation,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Zap,
  TrendingUp,
  Info
} from 'lucide-react';
import AIPriceValidationService, { PriceValidationInput, PriceValidationResult } from '../services/aiPriceValidationService';
import AssignmentService from '../services/assignmentService';

interface ShipmentFormData {
  pickupLocation: {
    address: string;
    pinCode: string;
    lat: number;
    lng: number;
  };
  dropLocation: {
    address: string;
    pinCode: string;
    lat: number;
    lng: number;
  };
  consignmentDetails: {
    items: string;
    weight: string;
    volume: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
    };
    description: string;
  };
  customerInfo: {
    receiverName: string;
    receiverPhone: string;
    receiverEmail: string;
    specialInstructions: string;
  };
  preferences: {
    preferredPickupWindow: {
      start: string;
      end: string;
    };
    preferredDeliveryWindow: {
      start: string;
      end: string;
    };
    urgency: 'normal' | 'express';
    vehicleTypePreference: string;
    insuranceRequired: boolean;
  };
  pricing: {
    submittedPrice: string;
    recommendedPrice?: number;
    confidenceScore?: number;
    priceFlag?: 'OK' | 'LOW' | 'TOO_HIGH';
    breakdown?: any;
    factors?: any;
  };
}

const CreateShipment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ShipmentFormData>({
    pickupLocation: { address: '', pinCode: '', lat: 0, lng: 0 },
    dropLocation: { address: '', pinCode: '', lat: 0, lng: 0 },
    consignmentDetails: {
      items: '',
      weight: '',
      volume: '',
      dimensions: { length: '', width: '', height: '' },
      description: ''
    },
    customerInfo: {
      receiverName: '',
      receiverPhone: '',
      receiverEmail: '',
      specialInstructions: ''
    },
    preferences: {
      preferredPickupWindow: { start: '', end: '' },
      preferredDeliveryWindow: { start: '', end: '' },
      urgency: 'normal',
      vehicleTypePreference: '',
      insuranceRequired: false
    },
    pricing: {
      submittedPrice: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingPrice, setIsValidatingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceValidationResult, setPriceValidationResult] = useState<PriceValidationResult | null>(null);

  const aiPriceService = AIPriceValidationService.getInstance();
  const assignmentService = AssignmentService.getInstance();

  const vehicleTypes = [
    { value: 'truck', label: 'Truck', description: 'Heavy goods transport' },
    { value: 'van', label: 'Van', description: 'Medium goods transport' },
    { value: 'tempo', label: 'Tempo', description: 'Light goods transport' },
    { value: 'container', label: 'Container', description: 'Container transport' },
    { value: 'trailer', label: 'Trailer', description: 'Heavy trailer transport' }
  ];

  const urgencyOptions = [
    { value: 'normal', label: 'Normal', description: 'Standard delivery timeline' },
    { value: 'express', label: 'Express', description: 'Priority delivery (+50% cost)' }
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof ShipmentFormData],
        [childField]: value
      }
    }));
  };

  const handleDeepChange = (parentField: string, childField: string, grandChildField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof ShipmentFormData],
        [childField]: {
          ...(prev[parentField as keyof ShipmentFormData] as any)[childField],
          [grandChildField]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.pickupLocation.address.trim()) newErrors.pickupAddress = 'Pickup address is required';
        if (!formData.pickupLocation.pinCode.trim()) newErrors.pickupPinCode = 'Pickup PIN code is required';
        if (!formData.dropLocation.address.trim()) newErrors.dropAddress = 'Drop address is required';
        if (!formData.dropLocation.pinCode.trim()) newErrors.dropPinCode = 'Drop PIN code is required';
        break;
      case 2:
        if (!formData.consignmentDetails.items.trim()) newErrors.items = 'Items description is required';
        if (!formData.consignmentDetails.weight.trim()) newErrors.weight = 'Weight is required';
        if (!formData.consignmentDetails.volume.trim()) newErrors.volume = 'Volume is required';
        break;
      case 3:
        if (!formData.customerInfo.receiverName.trim()) newErrors.receiverName = 'Receiver name is required';
        if (!formData.customerInfo.receiverPhone.trim()) newErrors.receiverPhone = 'Receiver phone is required';
        break;
      case 4:
        if (!formData.preferences.preferredPickupWindow.start) newErrors.pickupStart = 'Pickup start time is required';
        if (!formData.preferences.preferredPickupWindow.end) newErrors.pickupEnd = 'Pickup end time is required';
        if (!formData.preferences.preferredDeliveryWindow.start) newErrors.deliveryStart = 'Delivery start time is required';
        if (!formData.preferences.preferredDeliveryWindow.end) newErrors.deliveryEnd = 'Delivery end time is required';
        break;
      case 5:
        if (!formData.pricing.submittedPrice.trim()) newErrors.submittedPrice = 'Price is required';
        if (isNaN(parseFloat(formData.pricing.submittedPrice))) newErrors.submittedPrice = 'Please enter a valid price';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validatePrice = async () => {
    if (!formData.pricing.submittedPrice || isNaN(parseFloat(formData.pricing.submittedPrice))) {
      setErrors(prev => ({ ...prev, submittedPrice: 'Please enter a valid price' }));
      return;
    }

    setIsValidatingPrice(true);
    try {
      const input: PriceValidationInput = {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        consignmentDetails: {
          weight: parseFloat(formData.consignmentDetails.weight),
          volume: parseFloat(formData.consignmentDetails.volume),
          dimensions: {
            length: parseFloat(formData.consignmentDetails.dimensions.length),
            width: parseFloat(formData.consignmentDetails.dimensions.width),
            height: parseFloat(formData.consignmentDetails.dimensions.height)
          },
          items: formData.consignmentDetails.items,
          description: formData.consignmentDetails.description
        },
        vehicleType: formData.preferences.vehicleTypePreference,
        urgency: formData.preferences.urgency,
        insuranceRequired: formData.preferences.insuranceRequired,
        preferredPickupWindow: formData.preferences.preferredPickupWindow,
        preferredDeliveryWindow: formData.preferences.preferredDeliveryWindow
      };

      const result = await aiPriceService.validatePrice(parseFloat(formData.pricing.submittedPrice), input);
      
      setPriceValidationResult(result);
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          recommendedPrice: result.recommendedPrice,
          confidenceScore: result.confidenceScore,
          priceFlag: result.priceFlag,
          breakdown: result.breakdown,
          factors: result.factors
        }
      }));

    } catch (error) {
      setErrors(prev => ({ ...prev, priceValidation: 'Price validation failed. Please try again.' }));
    } finally {
      setIsValidatingPrice(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create shipment in database
      const shipmentData = {
        pickup_location: formData.pickupLocation,
        drop_location: formData.dropLocation,
        consignment_details: formData.consignmentDetails,
        customer_info: formData.customerInfo,
        price_submitted: parseFloat(formData.pricing.submittedPrice),
        price_validated: true,
        recommended_price: formData.pricing.recommendedPrice,
        urgency: formData.preferences.urgency,
        vehicle_type_preference: formData.preferences.vehicleTypePreference,
        insurance_required: formData.preferences.insuranceRequired,
        preferred_pickup_window: formData.preferences.preferredPickupWindow,
        preferred_delivery_window: formData.preferences.preferredDeliveryWindow,
        status: 'CREATED'
      };

      // Simulate API call to create shipment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Start assignment process
      const assignmentResult = await assignmentService.assignShipment('mock-shipment-id');

      if (assignmentResult.success) {
        alert('Shipment created and assigned successfully!');
        // Reset form or redirect
        setCurrentStep(1);
        setFormData({
          pickupLocation: { address: '', pinCode: '', lat: 0, lng: 0 },
          dropLocation: { address: '', pinCode: '', lat: 0, lng: 0 },
          consignmentDetails: {
            items: '',
            weight: '',
            volume: '',
            dimensions: { length: '', width: '', height: '' },
            description: ''
          },
          customerInfo: {
            receiverName: '',
            receiverPhone: '',
            receiverEmail: '',
            specialInstructions: ''
          },
          preferences: {
            preferredPickupWindow: { start: '', end: '' },
            preferredDeliveryWindow: { start: '', end: '' },
            urgency: 'normal',
            vehicleTypePreference: '',
            insuranceRequired: false
          },
          pricing: {
            submittedPrice: ''
          }
        });
      } else {
        alert(`Shipment created but assignment failed: ${assignmentResult.reason}`);
      }

    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Failed to create shipment. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriceFlagColor = (flag: string) => {
    switch (flag) {
      case 'OK': return 'text-green-600 bg-green-100';
      case 'LOW': return 'text-yellow-600 bg-yellow-100';
      case 'TOO_HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriceFlagIcon = (flag: string) => {
    switch (flag) {
      case 'OK': return <CheckCircle className="h-4 w-4" />;
      case 'LOW': return <AlertCircle className="h-4 w-4" />;
      case 'TOO_HIGH': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Shipment</h1>
        <p className="text-gray-600">Fill in the details to create and assign your shipment</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Location</span>
          <span>Consignment</span>
          <span>Customer</span>
          <span>Preferences</span>
          <span>Pricing</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Step 1: Location Details */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation.address}
                  onChange={(e) => handleNestedChange('pickupLocation', 'address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter pickup address"
                />
                {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>}
                
                <input
                  type="text"
                  value={formData.pickupLocation.pinCode}
                  onChange={(e) => handleNestedChange('pickupLocation', 'pinCode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 ${
                    errors.pickupPinCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="PIN Code"
                />
                {errors.pickupPinCode && <p className="text-red-500 text-sm mt-1">{errors.pickupPinCode}</p>}
              </div>

              {/* Drop Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Drop Location
                </label>
                <input
                  type="text"
                  value={formData.dropLocation.address}
                  onChange={(e) => handleNestedChange('dropLocation', 'address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dropAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter drop address"
                />
                {errors.dropAddress && <p className="text-red-500 text-sm mt-1">{errors.dropAddress}</p>}
                
                <input
                  type="text"
                  value={formData.dropLocation.pinCode}
                  onChange={(e) => handleNestedChange('dropLocation', 'pinCode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 ${
                    errors.dropPinCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="PIN Code"
                />
                {errors.dropPinCode && <p className="text-red-500 text-sm mt-1">{errors.dropPinCode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Consignment Details */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Consignment Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline h-4 w-4 mr-1" />
                  Items Description
                </label>
                <textarea
                  value={formData.consignmentDetails.items}
                  onChange={(e) => handleNestedChange('consignmentDetails', 'items', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.items ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Describe the items being shipped"
                />
                {errors.items && <p className="text-red-500 text-sm mt-1">{errors.items}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.consignmentDetails.weight}
                    onChange={(e) => handleNestedChange('consignmentDetails', 'weight', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume (cbm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consignmentDetails.volume}
                    onChange={(e) => handleNestedChange('consignmentDetails', 'volume', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.volume ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.volume && <p className="text-red-500 text-sm mt-1">{errors.volume}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L×W×H)</label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      value={formData.consignmentDetails.dimensions.length}
                      onChange={(e) => handleDeepChange('consignmentDetails', 'dimensions', 'length', e.target.value)}
                      className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="L"
                    />
                    <input
                      type="number"
                      value={formData.consignmentDetails.dimensions.width}
                      onChange={(e) => handleDeepChange('consignmentDetails', 'dimensions', 'width', e.target.value)}
                      className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="W"
                    />
                    <input
                      type="number"
                      value={formData.consignmentDetails.dimensions.height}
                      onChange={(e) => handleDeepChange('consignmentDetails', 'dimensions', 'height', e.target.value)}
                      className="w-full px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="H"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Description</label>
                <textarea
                  value={formData.consignmentDetails.description}
                  onChange={(e) => handleNestedChange('consignmentDetails', 'description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any special handling instructions or additional details"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customer Information */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerInfo.receiverName}
                    onChange={(e) => handleNestedChange('customerInfo', 'receiverName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.receiverName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter receiver name"
                  />
                  {errors.receiverName && <p className="text-red-500 text-sm mt-1">{errors.receiverName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Receiver Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.customerInfo.receiverPhone}
                    onChange={(e) => handleNestedChange('customerInfo', 'receiverPhone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.receiverPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter receiver phone"
                  />
                  {errors.receiverPhone && <p className="text-red-500 text-sm mt-1">{errors.receiverPhone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Receiver Email
                </label>
                <input
                  type="email"
                  value={formData.customerInfo.receiverEmail}
                  onChange={(e) => handleNestedChange('customerInfo', 'receiverEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter receiver email (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                  value={formData.customerInfo.specialInstructions}
                  onChange={(e) => handleNestedChange('customerInfo', 'specialInstructions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Any special delivery instructions"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences & Settings</h3>
            
            <div className="space-y-6">
              {/* Time Windows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Preferred Pickup Window
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={formData.preferences.preferredPickupWindow.start}
                      onChange={(e) => handleDeepChange('preferences', 'preferredPickupWindow', 'start', e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.pickupStart ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="time"
                      value={formData.preferences.preferredPickupWindow.end}
                      onChange={(e) => handleDeepChange('preferences', 'preferredPickupWindow', 'end', e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.pickupEnd ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {(errors.pickupStart || errors.pickupEnd) && (
                    <p className="text-red-500 text-sm mt-1">{errors.pickupStart || errors.pickupEnd}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Preferred Delivery Window
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={formData.preferences.preferredDeliveryWindow.start}
                      onChange={(e) => handleDeepChange('preferences', 'preferredDeliveryWindow', 'start', e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.deliveryStart ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <input
                      type="time"
                      value={formData.preferences.preferredDeliveryWindow.end}
                      onChange={(e) => handleDeepChange('preferences', 'preferredDeliveryWindow', 'end', e.target.value)}
                      className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.deliveryEnd ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {(errors.deliveryStart || errors.deliveryEnd) && (
                    <p className="text-red-500 text-sm mt-1">{errors.deliveryStart || errors.deliveryEnd}</p>
                  )}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Urgency Level</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {urgencyOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.preferences.urgency === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleNestedChange('preferences', 'urgency', option.value)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.preferences.urgency === option.value}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Type Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Truck className="inline h-4 w-4 mr-1" />
                  Vehicle Type Preference
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicleTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.preferences.vehicleTypePreference === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleNestedChange('preferences', 'vehicleTypePreference', type.value)}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.preferences.vehicleTypePreference === type.value}
                          onChange={() => {}}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.insuranceRequired}
                  onChange={(e) => handleNestedChange('preferences', 'insuranceRequired', e.target.checked)}
                  className="mr-3"
                />
                <label className="text-sm font-medium text-gray-700">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Insurance Required (+10% cost)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Pricing */}
        {currentStep === 5 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Pricing & Payment</h3>
            
            <div className="space-y-6">
              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Your Price (₹)
                </label>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    value={formData.pricing.submittedPrice}
                    onChange={(e) => handleNestedChange('pricing', 'submittedPrice', e.target.value)}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.submittedPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your price"
                  />
                  <button
                    onClick={validatePrice}
                    disabled={isValidatingPrice || !formData.pricing.submittedPrice}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isValidatingPrice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span>{isValidatingPrice ? 'Validating...' : 'Validate Price'}</span>
                  </button>
                </div>
                {errors.submittedPrice && <p className="text-red-500 text-sm mt-1">{errors.submittedPrice}</p>}
              </div>

              {/* Price Validation Result */}
              {priceValidationResult && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">AI Price Validation Result</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getPriceFlagColor(priceValidationResult.priceFlag)}`}>
                          {getPriceFlagIcon(priceValidationResult.priceFlag)}
                          <span>{priceValidationResult.priceFlag}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Confidence: {Math.round(priceValidationResult.confidenceScore * 100)}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Your Price:</span>
                          <span className="font-medium">₹{formData.pricing.submittedPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Recommended:</span>
                          <span className="font-medium">₹{priceValidationResult.recommendedPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Difference:</span>
                          <span className={`font-medium ${
                            parseFloat(formData.pricing.submittedPrice) < priceValidationResult.recommendedPrice 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                          }`}>
                            {parseFloat(formData.pricing.submittedPrice) < priceValidationResult.recommendedPrice ? '-' : '+'}
                            ₹{Math.abs(parseFloat(formData.pricing.submittedPrice) - priceValidationResult.recommendedPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Price Breakdown</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Price:</span>
                          <span>₹{priceValidationResult.breakdown.basePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance:</span>
                          <span>×{priceValidationResult.breakdown.distanceMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Urgency:</span>
                          <span>×{priceValidationResult.breakdown.urgencyMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle Type:</span>
                          <span>×{priceValidationResult.breakdown.vehicleTypeMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <span>×{priceValidationResult.breakdown.insuranceMultiplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Demand:</span>
                          <span>×{priceValidationResult.breakdown.demandMultiplier}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Factors */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Route Factors</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Distance:</span>
                        <div className="font-medium">{priceValidationResult.factors.distance} km</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <div className="font-medium">{priceValidationResult.factors.estimatedDuration}h</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Complexity:</span>
                        <div className="font-medium capitalize">{priceValidationResult.factors.routeComplexity}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Demand:</span>
                        <div className="font-medium capitalize">{priceValidationResult.factors.demandLevel}</div>
                      </div>
                    </div>
                  </div>

                  {/* Warning for low price */}
                  {priceValidationResult.priceFlag === 'LOW' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h6 className="font-medium text-yellow-800">Price May Be Too Low</h6>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your price is significantly below the recommended rate. This may result in slower assignment or no takers.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipment Cost:</span>
                    <span className="font-medium">₹{formData.pricing.submittedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Commission (5%):</span>
                    <span className="font-medium">₹{(parseFloat(formData.pricing.submittedPrice) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & Fees:</span>
                    <span className="font-medium">₹{(parseFloat(formData.pricing.submittedPrice) * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total Amount:</span>
                      <span className="font-bold text-lg">₹{(parseFloat(formData.pricing.submittedPrice) * 1.07).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !priceValidationResult}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Creating Shipment...' : 'Create Shipment'}</span>
            </button>
          )}
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h6 className="font-medium text-red-800">Please fix the following errors:</h6>
                <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateShipment;