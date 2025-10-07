import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  MoreVertical,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import PaymentSettlementService from '../services/paymentSettlementService';
import AssignmentService from '../services/assignmentService';

interface ShipmentData {
  id: string;
  vcodeShipper: string;
  shipperId: string;
  pickupLocation: { address: string; lat: number; lng: number };
  dropLocation: { address: string; lat: number; lng: number };
  consignmentDetails: { items: string; weight: string; volume: string };
  customerInfo: { receiverName: string; receiverPhone: string };
  priceSubmitted: number;
  priceValidated: boolean;
  recommendedPrice: number;
  status: string;
  assignedFleetId?: string;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  escrowTxnId?: string;
  commissionAmount: number;
  assignedFleet?: {
    name: string;
    contact: string;
  };
  assignedDriver?: {
    name: string;
    phone: string;
  };
}

interface ShipmentStats {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  cancelledShipments: number;
  totalValue: number;
  averageValue: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
}

const AdminShipmentDashboard: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<ShipmentData[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null);
  const [stats, setStats] = useState<ShipmentStats>({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    cancelledShipments: 0,
    totalValue: 0,
    averageValue: 0,
    onTimeDeliveryRate: 0,
    averageDeliveryTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const paymentService = PaymentSettlementService.getInstance();
  const assignmentService = AssignmentService.getInstance();

  useEffect(() => {
    loadShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, filter, searchTerm]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockShipments: ShipmentData[] = [
        {
          id: 'SHIP-001',
          vcodeShipper: 'SHP-123456',
          shipperId: 'shipper1',
          pickupLocation: { address: '123 Industrial Area, Delhi', lat: 28.6139, lng: 77.2090 },
          dropLocation: { address: '456 Business Park, Mumbai', lat: 19.0760, lng: 72.8777 },
          consignmentDetails: { items: 'Electronics Components', weight: '150', volume: '2.5' },
          customerInfo: { receiverName: 'Priya Sharma', receiverPhone: '+91-9876543211' },
          priceSubmitted: 15000,
          priceValidated: true,
          recommendedPrice: 16000,
          status: 'DELIVERED',
          assignedFleetId: 'fleet1',
          assignedVehicleId: 'vehicle1',
          assignedDriverId: 'driver1',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T18:30:00Z',
          assignedAt: '2024-01-15T10:30:00Z',
          pickedUpAt: '2024-01-15T12:00:00Z',
          deliveredAt: '2024-01-15T18:30:00Z',
          escrowTxnId: 'ESCROW-001',
          commissionAmount: 750,
          assignedFleet: { name: 'ABC Transport Ltd', contact: '+91-9876543211' },
          assignedDriver: { name: 'Rajesh Kumar', phone: '+91-9876543210' }
        },
        {
          id: 'SHIP-002',
          vcodeShipper: 'SHP-123457',
          shipperId: 'shipper2',
          pickupLocation: { address: '789 Warehouse, Bangalore', lat: 12.9716, lng: 77.5946 },
          dropLocation: { address: '321 Factory, Chennai', lat: 13.0827, lng: 80.2707 },
          consignmentDetails: { items: 'Textile Materials', weight: '200', volume: '3.0' },
          customerInfo: { receiverName: 'Suresh Patel', receiverPhone: '+91-9876543212' },
          priceSubmitted: 12000,
          priceValidated: true,
          recommendedPrice: 13000,
          status: 'IN_TRANSIT',
          assignedFleetId: 'fleet2',
          assignedVehicleId: 'vehicle2',
          assignedDriverId: 'driver2',
          createdAt: '2024-01-16T09:00:00Z',
          updatedAt: '2024-01-16T14:00:00Z',
          assignedAt: '2024-01-16T09:30:00Z',
          pickedUpAt: '2024-01-16T11:00:00Z',
          escrowTxnId: 'ESCROW-002',
          commissionAmount: 600,
          assignedFleet: { name: 'XYZ Logistics', contact: '+91-9876543213' },
          assignedDriver: { name: 'Suresh Patel', phone: '+91-9876543212' }
        },
        {
          id: 'SHIP-003',
          vcodeShipper: 'SHP-123458',
          shipperId: 'shipper3',
          pickupLocation: { address: '555 Tech Park, Hyderabad', lat: 17.3850, lng: 78.4867 },
          dropLocation: { address: '777 Industrial Zone, Pune', lat: 18.5204, lng: 73.8567 },
          consignmentDetails: { items: 'Machinery Parts', weight: '500', volume: '5.0' },
          customerInfo: { receiverName: 'Amit Singh', receiverPhone: '+91-9876543214' },
          priceSubmitted: 25000,
          priceValidated: true,
          recommendedPrice: 26000,
          status: 'PENDING_ASSIGN',
          createdAt: '2024-01-17T08:00:00Z',
          updatedAt: '2024-01-17T08:00:00Z',
          escrowTxnId: 'ESCROW-003',
          commissionAmount: 1250
        },
        {
          id: 'SHIP-004',
          vcodeShipper: 'SHP-123459',
          shipperId: 'shipper4',
          pickupLocation: { address: '999 Port Area, Kochi', lat: 9.9312, lng: 76.2673 },
          dropLocation: { address: '111 Commercial Hub, Ahmedabad', lat: 23.0225, lng: 72.5714 },
          consignmentDetails: { items: 'Agricultural Products', weight: '300', volume: '4.0' },
          customerInfo: { receiverName: 'Ravi Kumar', receiverPhone: '+91-9876543215' },
          priceSubmitted: 18000,
          priceValidated: true,
          recommendedPrice: 19000,
          status: 'CANCELLED',
          createdAt: '2024-01-18T07:00:00Z',
          updatedAt: '2024-01-18T10:00:00Z',
          escrowTxnId: 'ESCROW-004',
          commissionAmount: 900
        }
      ];
      
      setShipments(mockShipments);
      calculateStats(mockShipments);
    } catch (error) {
      console.error('Error loading shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (shipmentData: ShipmentData[]) => {
    const totalShipments = shipmentData.length;
    const activeShipments = shipmentData.filter(s => ['ASSIGNED', 'PICKUP_ARRIVED', 'PICKED_UP', 'IN_TRANSIT'].includes(s.status)).length;
    const completedShipments = shipmentData.filter(s => s.status === 'DELIVERED').length;
    const cancelledShipments = shipmentData.filter(s => s.status === 'CANCELLED').length;
    const totalValue = shipmentData.reduce((sum, s) => sum + s.priceSubmitted, 0);
    const averageValue = totalValue / totalShipments;
    
    // Mock calculations for delivery metrics
    const onTimeDeliveryRate = 0.85; // 85%
    const averageDeliveryTime = 2.5; // hours

    setStats({
      totalShipments,
      activeShipments,
      completedShipments,
      cancelledShipments,
      totalValue,
      averageValue,
      onTimeDeliveryRate,
      averageDeliveryTime
    });
  };

  const filterShipments = () => {
    let filtered = shipments;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.vcodeShipper.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.pickupLocation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.dropLocation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.consignmentDetails.items.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredShipments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED': return 'bg-blue-100 text-blue-800';
      case 'PENDING_ASSIGN': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
      case 'PICKUP_ARRIVED': return 'bg-orange-100 text-orange-800';
      case 'PICKED_UP': return 'bg-indigo-100 text-indigo-800';
      case 'IN_TRANSIT': return 'bg-cyan-100 text-cyan-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED': return <Package className="h-4 w-4" />;
      case 'PUBLISHED': return <Package className="h-4 w-4" />;
      case 'PENDING_ASSIGN': return <Clock className="h-4 w-4" />;
      case 'ASSIGNED': return <CheckCircle className="h-4 w-4" />;
      case 'PICKUP_ARRIVED': return <MapPin className="h-4 w-4" />;
      case 'PICKED_UP': return <Truck className="h-4 w-4" />;
      case 'IN_TRANSIT': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleManualAssignment = async (shipmentId: string) => {
    try {
      const result = await assignmentService.assignShipment(shipmentId);
      if (result.success) {
        alert('Shipment assigned successfully!');
        loadShipments();
      } else {
        alert(`Assignment failed: ${result.reason}`);
      }
    } catch (error) {
      alert('Failed to assign shipment');
    }
  };

  const handleSettlementOverride = async (shipmentId: string) => {
    try {
      const success = await paymentService.manualSettlementOverride(shipmentId, 'admin', 'Manual override');
      if (success) {
        alert('Settlement processed successfully!');
        loadShipments();
      } else {
        alert('Failed to process settlement');
      }
    } catch (error) {
      alert('Failed to process settlement');
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    if (confirm('Are you sure you want to cancel this shipment?')) {
      try {
        // Simulate cancellation
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Shipment cancelled successfully!');
        loadShipments();
      } catch (error) {
        alert('Failed to cancel shipment');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipment Management Dashboard</h1>
        <p className="text-gray-600">Monitor and manage all shipments across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedShipments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Delivery Rate</p>
              <p className="text-xl font-bold text-green-600">{Math.round(stats.onTimeDeliveryRate * 100)}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Delivery Time</p>
              <p className="text-xl font-bold text-blue-600">{stats.averageDeliveryTime}h</p>
            </div>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Value</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.averageValue)}</p>
            </div>
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="CREATED">Created</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING_ASSIGN">Pending Assignment</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKUP_ARRIVED">Pickup Arrived</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={loadShipments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                      <div className="text-sm text-gray-500">{shipment.vcodeShipper}</div>
                      <div className="text-xs text-gray-400">{shipment.consignmentDetails.items}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-32">{shipment.pickupLocation.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span className="truncate max-w-32">{shipment.dropLocation.address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{shipment.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{formatCurrency(shipment.priceSubmitted)}</div>
                    <div className="text-xs text-gray-500">Commission: {formatCurrency(shipment.commissionAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.assignedFleet ? (
                      <div>
                        <div className="font-medium">{shipment.assignedFleet.name}</div>
                        <div className="text-xs text-gray-500">{shipment.assignedDriver?.name}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(shipment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedShipment(shipment);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {shipment.status === 'PENDING_ASSIGN' && (
                        <button
                          onClick={() => handleManualAssignment(shipment.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Manual Assignment"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      )}
                      {shipment.status === 'DELIVERED' && shipment.escrowTxnId && (
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShowSettlementModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Settlement"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      {!['DELIVERED', 'CANCELLED'].includes(shipment.status) && (
                        <button
                          onClick={() => handleCancelShipment(shipment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Shipment"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Modal */}
      {showDetailsModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Shipment Details - {selectedShipment.id}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Shipment ID:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Shipper VCODE:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.vcodeShipper}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                      {getStatusIcon(selectedShipment.status)}
                      <span className="ml-1">{selectedShipment.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <p className="text-sm text-gray-900">{formatDate(selectedShipment.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                    <p className="text-sm text-gray-900">{formatDate(selectedShipment.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Route Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Pickup Location:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.pickupLocation.address}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Drop Location:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.dropLocation.address}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Items:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.consignmentDetails.items}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Weight:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.consignmentDetails.weight} kg</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Volume:</span>
                    <p className="text-sm text-gray-900">{selectedShipment.consignmentDetails.volume} cbm</p>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              {selectedShipment.assignedFleet && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Assignment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Fleet:</span>
                      <p className="text-sm text-gray-900">{selectedShipment.assignedFleet.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Driver:</span>
                      <p className="text-sm text-gray-900">{selectedShipment.assignedDriver?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Driver Phone:</span>
                      <p className="text-sm text-gray-900">{selectedShipment.assignedDriver?.phone}</p>
                    </div>
                    {selectedShipment.assignedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Assigned At:</span>
                        <p className="text-sm text-gray-900">{formatDate(selectedShipment.assignedAt)}</p>
                      </div>
                    )}
                    {selectedShipment.pickedUpAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Picked Up At:</span>
                        <p className="text-sm text-gray-900">{formatDate(selectedShipment.pickedUpAt)}</p>
                      </div>
                    )}
                    {selectedShipment.deliveredAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Delivered At:</span>
                        <p className="text-sm text-gray-900">{formatDate(selectedShipment.deliveredAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Submitted Price:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedShipment.priceSubmitted)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Recommended Price:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedShipment.recommendedPrice)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Commission:</span>
                    <p className="text-sm text-gray-900">{formatCurrency(selectedShipment.commissionAmount)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Price Validated:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedShipment.priceValidated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedShipment.priceValidated ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedShipment.escrowTxnId && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Escrow Transaction:</span>
                      <p className="text-sm text-gray-900">{selectedShipment.escrowTxnId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {showSettlementModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Settlement Override</h2>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Shipment: <span className="font-medium">{selectedShipment.id}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Amount: <span className="font-medium">{formatCurrency(selectedShipment.priceSubmitted - selectedShipment.commissionAmount)}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Payee: <span className="font-medium">{selectedShipment.assignedFleet?.name}</span>
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h6 className="font-medium text-yellow-800">Manual Override</h6>
                    <p className="text-sm text-yellow-700 mt-1">
                      This will manually process the settlement, bypassing the normal hold period and dispute checks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSettlementOverride(selectedShipment.id);
                    setShowSettlementModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Process Settlement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipmentDashboard;
