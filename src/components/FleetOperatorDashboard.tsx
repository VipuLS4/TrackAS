import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Star, 
  Plus, 
  Eye, 
  Edit, 
  RefreshCw, 
  Phone, 
  Mail, 
  Settings,
  Zap,
  Target,
  Activity,
  CreditCard,
  FileText,
  Shield,
  Calendar
} from 'lucide-react';

interface FleetStats {
  totalVehicles: number;
  activeDrivers: number;
  activeShipments: number;
  acceptanceRate: number;
  fleetUtilization: number;
  avgAssignmentTime: number;
  reliabilityScore: number;
  monthlyEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  subscriptionStatus: string;
  subscriptionTier: string;
}

interface ShipmentRequest {
  id: string;
  shipperName: string;
  pickupLocation: string;
  dropLocation: string;
  consignmentDetails: {
    items: string;
    weight: number;
    volume: number;
  };
  price: number;
  urgency: string;
  pickupTime: string;
  expiresAt: string;
  priority: number;
}

interface Vehicle {
  id: string;
  vcode: string;
  type: string;
  capacity: number;
  currentLocation: string;
  status: string;
  driverName?: string;
  driverPhone?: string;
  currentShipment?: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  phone: string;
  rating: number;
  status: string;
  assignedVehicle?: string;
}

const FleetOperatorDashboard: React.FC = () => {
  const [stats, setStats] = useState<FleetStats>({
    totalVehicles: 0,
    activeDrivers: 0,
    activeShipments: 0,
    acceptanceRate: 0,
    fleetUtilization: 0,
    avgAssignmentTime: 0,
    reliabilityScore: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    subscriptionStatus: 'ACTIVE',
    subscriptionTier: 'premium'
  });
  
  const [shipmentRequests, setShipmentRequests] = useState<ShipmentRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadShipmentRequests();
      await loadVehicles();
      await loadDrivers();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const mockStats: FleetStats = {
        totalVehicles: 25,
        activeDrivers: 22,
        activeShipments: 8,
        acceptanceRate: 87.5,
        fleetUtilization: 78.2,
        avgAssignmentTime: 45,
        reliabilityScore: 4.6,
        monthlyEarnings: 450000,
        todayEarnings: 18500,
        weeklyEarnings: 125000,
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: 'premium'
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadShipmentRequests = async () => {
    try {
      const mockRequests: ShipmentRequest[] = [
        {
          id: 'REQ-001',
          shipperName: 'XYZ Manufacturing',
          pickupLocation: 'Mumbai, Maharashtra',
          dropLocation: 'Delhi, Delhi',
          consignmentDetails: {
            items: 'Electronics Components',
            weight: 500,
            volume: 2.5
          },
          price: 15000,
          urgency: 'normal',
          pickupTime: '2024-01-15T14:00:00Z',
          expiresAt: '2024-01-15T14:02:00Z',
          priority: 2
        },
        {
          id: 'REQ-002',
          shipperName: 'PQR Industries',
          pickupLocation: 'Bangalore, Karnataka',
          dropLocation: 'Chennai, Tamil Nadu',
          consignmentDetails: {
            items: 'Textile Goods',
            weight: 800,
            volume: 4.0
          },
          price: 12000,
          urgency: 'express',
          pickupTime: '2024-01-15T16:00:00Z',
          expiresAt: '2024-01-15T16:02:00Z',
          priority: 3
        }
      ];
      setShipmentRequests(mockRequests);
    } catch (error) {
      console.error('Error loading shipment requests:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const mockVehicles: Vehicle[] = [
        {
          id: 'VEH-001',
          vcode: 'FLEET-825103',
          type: 'Truck',
          capacity: 1000,
          currentLocation: 'Mumbai, Maharashtra',
          status: 'AVAILABLE',
          driverName: 'Amit Singh',
          driverPhone: '+91 98765 43210'
        },
        {
          id: 'VEH-002',
          vcode: 'FLEET-825104',
          type: 'Truck',
          capacity: 800,
          currentLocation: 'Delhi, Delhi',
          status: 'IN_TRANSIT',
          driverName: 'Suresh Kumar',
          driverPhone: '+91 98765 43211',
          currentShipment: 'SHIP-001'
        }
      ];
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      const mockDrivers: Driver[] = [
        {
          id: 'DRV-001',
          name: 'Amit Singh',
          licenseNo: 'DL123456789',
          phone: '+91 98765 43210',
          rating: 4.8,
          status: 'AVAILABLE',
          assignedVehicle: 'VEH-001'
        },
        {
          id: 'DRV-002',
          name: 'Suresh Kumar',
          licenseNo: 'DL987654321',
          phone: '+91 98765 43211',
          rating: 4.6,
          status: 'BUSY',
          assignedVehicle: 'VEH-002'
        }
      ];
      setDrivers(mockDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleAcceptShipment = async (requestId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Shipment ${requestId} accepted! Please assign driver and vehicle.`);
      loadShipmentRequests();
    } catch (error) {
      alert('Failed to accept shipment');
    }
  };

  const handleRejectShipment = async (requestId: string) => {
    if (confirm('Are you sure you want to reject this shipment?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Shipment ${requestId} rejected`);
        loadShipmentRequests();
      } catch (error) {
        alert('Failed to reject shipment');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'express': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fleet Operator Dashboard</h1>
        <p className="text-gray-600">Manage your fleet, drivers, and shipment assignments</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              <div className="flex items-center mt-1">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">{stats.fleetUtilization}% utilized</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDrivers}</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600 ml-1">{stats.reliabilityScore} avg rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
              <div className="flex items-center mt-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 ml-1">{stats.acceptanceRate}% acceptance</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayEarnings)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 ml-1">+12% vs yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
              <p className="text-xl font-bold text-green-600">{stats.acceptanceRate}%</p>
              <p className="text-sm text-gray-500">Target: ≥90%</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
              <p className="text-xl font-bold text-blue-600">{stats.fleetUtilization}%</p>
              <p className="text-sm text-gray-500">Optimal: 80-85%</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Assignment Time</p>
              <p className="text-xl font-bold text-purple-600">{stats.avgAssignmentTime}s</p>
              <p className="text-sm text-gray-500">Response time</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reliability Score</p>
              <p className="text-xl font-bold text-yellow-600">{stats.reliabilityScore}</p>
              <p className="text-sm text-gray-500">Target: ≥4.5</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Subscription Status</h3>
                <p className="text-sm text-gray-600">
                  {stats.subscriptionTier.toUpperCase()} Plan - {stats.subscriptionStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.subscriptionStatus)}`}>
                {stats.subscriptionStatus}
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'requests', label: 'Priority Requests', icon: Package },
              { id: 'fleet', label: 'Fleet Tracker', icon: Truck },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'maintenance', label: 'Maintenance', icon: Settings }
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">View Requests</p>
                <p className="text-sm text-blue-700">{shipmentRequests.length} pending</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Fleet Tracker</p>
                <p className="text-sm text-green-700">{stats.totalVehicles} vehicles</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Earnings</p>
                <p className="text-sm text-purple-700">View settlements</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">Manage Drivers</p>
                <p className="text-sm text-orange-700">{stats.activeDrivers} drivers</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {vehicles.slice(0, 5).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{vehicle.vcode}</p>
                      <p className="text-sm text-gray-600">{vehicle.driverName} - {vehicle.currentLocation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                    {vehicle.currentShipment && (
                      <p className="text-sm text-gray-500 mt-1">{vehicle.currentShipment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Priority Shipment Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipmentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.id}</div>
                        <div className="text-sm text-gray-500">{request.consignmentDetails.items}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.shipperName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.pickupLocation} → {request.dropLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(request.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptShipment(request.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Accept"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectShipment(request.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Fleet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status</h3>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{vehicle.vcode}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Type: {vehicle.type} | Capacity: {vehicle.capacity}kg</p>
                      <p>Location: {vehicle.currentLocation}</p>
                      {vehicle.driverName && (
                        <p>Driver: {vehicle.driverName} ({vehicle.driverPhone})</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Status</h3>
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div key={driver.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{driver.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {driver.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>License: {driver.licenseNo}</p>
                      <p>Phone: {driver.phone}</p>
                      <p>Rating: {driver.rating}⭐</p>
                      {driver.assignedVehicle && (
                        <p>Vehicle: {driver.assignedVehicle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="space-y-6">
          {/* Earnings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayEarnings)}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Earnings</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.weeklyEarnings)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.monthlyEarnings)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Earnings Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">View Settlements</p>
                <p className="text-sm text-green-700">Payment history</p>
              </button>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Download Reports</p>
                <p className="text-sm text-blue-700">Earnings reports</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Analytics</p>
                <p className="text-sm text-purple-700">Performance metrics</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">Payment Settings</p>
                <p className="text-sm text-orange-700">Bank details</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Maintenance Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Maintenance & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Document Expiry Alerts</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">VEH-003 Insurance</p>
                    <p className="text-xs text-yellow-700">Expires in 15 days</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-900">VEH-005 Pollution Certificate</p>
                    <p className="text-xs text-red-700">Expires in 5 days</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vehicle Health Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vehicles in Service</span>
                    <span className="font-medium text-green-600">23/25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Under Maintenance</span>
                    <span className="font-medium text-yellow-600">2/25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Service Due</span>
                    <span className="font-medium text-blue-600">5 vehicles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetOperatorDashboard;
