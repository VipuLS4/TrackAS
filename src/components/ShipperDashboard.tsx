import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Truck, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  RefreshCw, 
  Phone, 
  Mail, 
  Star, 
  Navigation, 
  Zap, 
  Shield, 
  CreditCard, 
  Receipt,
  Target,
  Activity,
  Users,
  Settings
} from 'lucide-react';

interface ShipperStats {
  totalShipments: number;
  activeShipments: number;
  completedShipments: number;
  onTimeDelivery: number;
  avgTransitTime: number;
  totalSpent: number;
  avgCostPerKm: number;
  activeRoutes: number;
  avgRating: number;
  pendingPayments: number;
}

interface Shipment {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  consignmentDetails: {
    items: string;
    weight: number;
    volume: number;
  };
  status: string;
  assignedFleet?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleVcode?: string;
  eta?: string;
  actualDeliveryTime?: string;
  price: number;
  commission: number;
  createdAt: string;
  updatedAt: string;
}

interface BillingRecord {
  id: string;
  shipmentId: string;
  type: 'ESCROW' | 'COMMISSION' | 'REFUND';
  amount: number;
  status: string;
  date: string;
  invoiceUrl?: string;
}

interface PerformanceMetric {
  route: string;
  shipments: number;
  avgTransitTime: number;
  onTimeRate: number;
  avgCost: number;
  rating: number;
}

const ShipperDashboard: React.FC = () => {
  const [stats, setStats] = useState<ShipperStats>({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    onTimeDelivery: 0,
    avgTransitTime: 0,
    totalSpent: 0,
    avgCostPerKm: 0,
    activeRoutes: 0,
    avgRating: 0,
    pendingPayments: 0
  });
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadShipments();
      await loadBillingRecords();
      await loadPerformanceMetrics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockStats: ShipperStats = {
        totalShipments: 156,
        activeShipments: 12,
        completedShipments: 144,
        onTimeDelivery: 94.2,
        avgTransitTime: 18.5,
        totalSpent: 2450000,
        avgCostPerKm: 12.5,
        activeRoutes: 8,
        avgRating: 4.6,
        pendingPayments: 3
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadShipments = async () => {
    try {
      const mockShipments: Shipment[] = [
        {
          id: 'SHIP-001',
          pickupLocation: 'Mumbai, Maharashtra',
          dropLocation: 'Delhi, Delhi',
          consignmentDetails: {
            items: 'Electronics Components',
            weight: 500,
            volume: 2.5
          },
          status: 'IN_TRANSIT',
          assignedFleet: 'ABC Transport Ltd',
          driverName: 'Amit Singh',
          driverPhone: '+91 98765 43210',
          vehicleVcode: 'FLEET-825103',
          eta: '2 hours',
          price: 15000,
          commission: 1050,
          createdAt: '2024-01-15T06:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'SHIP-002',
          pickupLocation: 'Bangalore, Karnataka',
          dropLocation: 'Chennai, Tamil Nadu',
          consignmentDetails: {
            items: 'Textile Goods',
            weight: 800,
            volume: 4.0
          },
          status: 'DELIVERED',
          assignedFleet: 'Quick Delivery Co',
          driverName: 'Suresh Kumar',
          driverPhone: '+91 98765 43211',
          vehicleVcode: 'IND-593204',
          actualDeliveryTime: '2024-01-15T14:30:00Z',
          price: 12000,
          commission: 840,
          createdAt: '2024-01-15T08:30:00Z',
          updatedAt: '2024-01-15T14:30:00Z'
        },
        {
          id: 'SHIP-003',
          pickupLocation: 'Pune, Maharashtra',
          dropLocation: 'Hyderabad, Telangana',
          consignmentDetails: {
            items: 'Automotive Parts',
            weight: 300,
            volume: 1.8
          },
          status: 'PICKED_UP',
          assignedFleet: 'XYZ Logistics',
          driverName: 'Rajesh Patel',
          driverPhone: '+91 98765 43212',
          vehicleVcode: 'FLEET-825104',
          eta: '6 hours',
          price: 18000,
          commission: 1260,
          createdAt: '2024-01-15T11:00:00Z',
          updatedAt: '2024-01-15T13:45:00Z'
        }
      ];
      setShipments(mockShipments);
    } catch (error) {
      console.error('Error loading shipments:', error);
    }
  };

  const loadBillingRecords = async () => {
    try {
      const mockBilling: BillingRecord[] = [
        {
          id: 'BILL-001',
          shipmentId: 'SHIP-001',
          type: 'ESCROW',
          amount: 15000,
          status: 'HELD',
          date: '2024-01-15T06:00:00Z'
        },
        {
          id: 'BILL-002',
          shipmentId: 'SHIP-001',
          type: 'COMMISSION',
          amount: 1050,
          status: 'PAID',
          date: '2024-01-15T06:00:00Z'
        },
        {
          id: 'BILL-003',
          shipmentId: 'SHIP-002',
          type: 'ESCROW',
          amount: 12000,
          status: 'SETTLED',
          date: '2024-01-15T08:30:00Z'
        },
        {
          id: 'BILL-004',
          shipmentId: 'SHIP-002',
          type: 'COMMISSION',
          amount: 840,
          status: 'PAID',
          date: '2024-01-15T08:30:00Z'
        }
      ];
      setBillingRecords(mockBilling);
    } catch (error) {
      console.error('Error loading billing records:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const mockMetrics: PerformanceMetric[] = [
        {
          route: 'Mumbai → Delhi',
          shipments: 45,
          avgTransitTime: 16.2,
          onTimeRate: 96.7,
          avgCost: 14500,
          rating: 4.8
        },
        {
          route: 'Bangalore → Chennai',
          shipments: 32,
          avgTransitTime: 8.5,
          onTimeRate: 98.1,
          avgCost: 8500,
          rating: 4.7
        },
        {
          route: 'Pune → Hyderabad',
          shipments: 28,
          avgTransitTime: 12.3,
          onTimeRate: 92.9,
          avgCost: 12500,
          rating: 4.5
        }
      ];
      setPerformanceMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  };

  const handleCreateShipment = () => {
    // Navigate to create shipment page
    alert('Redirecting to Create Shipment...');
  };

  const handleTrackShipment = (shipmentId: string) => {
    alert(`Tracking shipment ${shipmentId}...`);
  };

  const handleCancelShipment = (shipmentId: string) => {
    if (confirm('Are you sure you want to cancel this shipment?')) {
      alert(`Shipment ${shipmentId} cancelled`);
      loadShipments();
    }
  };

  const handleDownloadInvoice = (billingId: string) => {
    alert(`Downloading invoice for ${billingId}...`);
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
      case 'CREATED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
      case 'PICKED_UP': return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'HELD': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'SETTLED': return 'bg-green-100 text-green-800';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipper Dashboard</h1>
        <p className="text-gray-600">Manage your shipments, track deliveries, and monitor performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+15%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
              <div className="flex items-center mt-1">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">In Transit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeDelivery}%</p>
              <div className="flex items-center mt-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 ml-1">Target: ≥95%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 ml-1">This month</span>
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
              <p className="text-sm font-medium text-gray-600">Avg Transit Time</p>
              <p className="text-xl font-bold text-blue-600">{stats.avgTransitTime}h</p>
              <p className="text-sm text-gray-500">Across all routes</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Cost/Km</p>
              <p className="text-xl font-bold text-green-600">₹{stats.avgCostPerKm}</p>
              <p className="text-sm text-gray-500">Cost efficiency</p>
            </div>
            <Navigation className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-xl font-bold text-purple-600">{stats.activeRoutes}</p>
              <p className="text-sm text-gray-500">Regular lanes</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-xl font-bold text-yellow-600">{stats.avgRating}⭐</p>
              <p className="text-sm text-gray-500">Service quality</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'shipments', label: 'My Shipments', icon: Package },
              { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
              { id: 'performance', label: 'Performance Analytics', icon: TrendingUp },
              { id: 'profile', label: 'Company Profile', icon: Settings }
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
              <button
                onClick={handleCreateShipment}
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Create Shipment</p>
                <p className="text-sm text-blue-700">Post new load</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Track Shipments</p>
                <p className="text-sm text-green-700">{stats.activeShipments} active</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Receipt className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">View Invoices</p>
                <p className="text-sm text-purple-700">Billing records</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">Performance</p>
                <p className="text-sm text-orange-700">Analytics & reports</p>
              </button>
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h3>
            <div className="space-y-3">
              {shipments.slice(0, 5).map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{shipment.id}</p>
                      <p className="text-sm text-gray-600">
                        {shipment.pickupLocation} → {shipment.dropLocation}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(shipment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">My Shipments</h3>
              <button
                onClick={handleCreateShipment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Shipment</span>
              </button>
            </div>
          </div>
          
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
                    Fleet/Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                        <div className="text-sm text-gray-500">{shipment.consignmentDetails.items}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {shipment.pickupLocation} → {shipment.dropLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.assignedFleet}</div>
                      <div className="text-sm text-gray-500">{shipment.driverName}</div>
                      <div className="text-sm text-gray-500">{shipment.vehicleVcode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shipment.eta || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(shipment.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTrackShipment(shipment.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Track"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Contact Driver">
                          <Phone className="h-4 w-4" />
                        </button>
                        {shipment.status === 'CREATED' && (
                          <button
                            onClick={() => handleCancelShipment(shipment.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <Trash2 className="h-4 w-4" />
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
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Billing & Invoices</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billingRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.shipmentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {record.invoiceUrl && (
                          <button
                            onClick={() => handleDownloadInvoice(record.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-green-600 hover:text-green-900" title="View Details">
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

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Performance</h3>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{metric.route}</span>
                      <span className="text-sm text-gray-600">{metric.shipments} shipments</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Transit:</span>
                        <span className="font-medium text-gray-900 ml-1">{metric.avgTransitTime}h</span>
                      </div>
                      <div>
                        <span className="text-gray-600">On-Time:</span>
                        <span className="font-medium text-green-600 ml-1">{metric.onTimeRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Cost:</span>
                        <span className="font-medium text-gray-900 ml-1">{formatCurrency(metric.avgCost)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium text-yellow-600 ml-1">{metric.rating}⭐</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-Time Delivery Rate</span>
                  <span className="font-medium text-green-600">{stats.onTimeDelivery}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Transit Time</span>
                  <span className="font-medium text-blue-600">{stats.avgTransitTime} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Cost per KM</span>
                  <span className="font-medium text-purple-600">₹{stats.avgCostPerKm}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-medium text-yellow-600">{stats.avgRating}⭐</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Routes</span>
                  <span className="font-medium text-orange-600">{stats.activeRoutes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Company Profile */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Business Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">XYZ Manufacturing Ltd</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <p className="mt-1 text-sm text-gray-900">27AABCU9603R1ZX</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                    <p className="mt-1 text-sm text-gray-900">AABCU9603R</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">logistics@xyzmanufacturing.com</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">+91 98765 43210</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">123 Industrial Area, Mumbai, Maharashtra 400001</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Business Registration</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">GST Certificate</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">Bank Details</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipperDashboard;
