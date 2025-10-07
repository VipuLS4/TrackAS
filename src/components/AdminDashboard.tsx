import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Truck, 
  CreditCard, 
  FileText, 
  Eye, 
  Edit, 
  Download, 
  RefreshCw, 
  Filter, 
  Search,
  Activity,
  Zap,
  Target,
  Globe,
  Calendar,
  Bell,
  UserCheck,
  UserX,
  Package2,
  Map,
  PieChart,
  LineChart,
  Database,
  Server,
  Lock,
  Unlock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeShipments: number;
  totalRevenue: number;
  pendingApprovals: number;
  avgApprovalTime: number;
  acceptanceRate: number;
  onTimeDelivery: number;
  disputeRate: number;
  activeFleets: number;
  activeShippers: number;
  dailyCommission: number;
  escrowHeld: number;
}

interface PendingApproval {
  id: string;
  type: 'shipper' | 'fleet' | 'individual';
  name: string;
  email: string;
  submittedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documents: string[];
}

interface ActiveShipment {
  id: string;
  shipperName: string;
  pickupLocation: string;
  dropLocation: string;
  status: string;
  assignedFleet?: string;
  driverName?: string;
  vehicleVcode?: string;
  eta?: string;
  createdAt: string;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: boolean;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeShipments: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    avgApprovalTime: 0,
    acceptanceRate: 0,
    onTimeDelivery: 0,
    disputeRate: 0,
    activeFleets: 0,
    activeShippers: 0,
    dailyCommission: 0,
    escrowHeld: 0
  });
  
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [activeShipments, setActiveShipments] = useState<ActiveShipment[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadPendingApprovals();
      await loadActiveShipments();
      await loadSystemAlerts();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalUsers: 1247,
        activeShipments: 89,
        totalRevenue: 2450000,
        pendingApprovals: 23,
        avgApprovalTime: 18.5,
        acceptanceRate: 92.3,
        onTimeDelivery: 96.7,
        disputeRate: 2.1,
        activeFleets: 156,
        activeShippers: 89,
        dailyCommission: 175000,
        escrowHeld: 890000
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const mockApprovals: PendingApproval[] = [
        {
          id: 'APP-001',
          type: 'fleet',
          name: 'ABC Transport Ltd',
          email: 'contact@abctransport.com',
          submittedAt: '2024-01-15T10:30:00Z',
          status: 'pending',
          documents: ['GST Certificate', 'Registration Certificate', 'Bank Details']
        },
        {
          id: 'APP-002',
          type: 'shipper',
          name: 'XYZ Manufacturing',
          email: 'logistics@xyzmanufacturing.com',
          submittedAt: '2024-01-15T09:15:00Z',
          status: 'under_review',
          documents: ['PAN Card', 'GST Certificate', 'Bank Statement']
        },
        {
          id: 'APP-003',
          type: 'individual',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@email.com',
          submittedAt: '2024-01-15T08:45:00Z',
          status: 'pending',
          documents: ['Aadhaar Card', 'PAN Card', 'Vehicle RC', 'Insurance']
        }
      ];
      setPendingApprovals(mockApprovals);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  };

  const loadActiveShipments = async () => {
    try {
      const mockShipments: ActiveShipment[] = [
        {
          id: 'SHIP-001',
          shipperName: 'XYZ Manufacturing',
          pickupLocation: 'Mumbai, Maharashtra',
          dropLocation: 'Delhi, Delhi',
          status: 'IN_TRANSIT',
          assignedFleet: 'ABC Transport Ltd',
          driverName: 'Amit Singh',
          vehicleVcode: 'FLEET-825103',
          eta: '2 hours',
          createdAt: '2024-01-15T06:00:00Z'
        },
        {
          id: 'SHIP-002',
          shipperName: 'PQR Industries',
          pickupLocation: 'Bangalore, Karnataka',
          dropLocation: 'Chennai, Tamil Nadu',
          status: 'PICKED_UP',
          assignedFleet: 'Quick Delivery Co',
          driverName: 'Suresh Kumar',
          vehicleVcode: 'IND-593204',
          eta: '4 hours',
          createdAt: '2024-01-15T08:30:00Z'
        }
      ];
      setActiveShipments(mockShipments);
    } catch (error) {
      console.error('Error loading active shipments:', error);
    }
  };

  const loadSystemAlerts = async () => {
    try {
      const mockAlerts: SystemAlert[] = [
        {
          id: 'ALERT-001',
          type: 'critical',
          title: 'Payment Gateway Issue',
          message: 'Razorpay API experiencing delays in payment processing',
          timestamp: '2024-01-15T11:00:00Z',
          actionRequired: true
        },
        {
          id: 'ALERT-002',
          type: 'warning',
          title: 'High Dispute Rate',
          message: 'Dispute rate increased to 2.1% this week',
          timestamp: '2024-01-15T10:30:00Z',
          actionRequired: false
        },
        {
          id: 'ALERT-003',
          type: 'info',
          title: 'System Maintenance',
          message: 'Scheduled maintenance window: 2 AM - 4 AM IST',
          timestamp: '2024-01-15T09:00:00Z',
          actionRequired: false
        }
      ];
      setSystemAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading system alerts:', error);
    }
  };

  const handleApproveUser = async (approvalId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('User approved successfully! VCODE issued.');
      loadPendingApprovals();
    } catch (error) {
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (approvalId: string) => {
    if (confirm('Are you sure you want to reject this user?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('User rejected');
        loadPendingApprovals();
      } catch (error) {
        alert('Failed to reject user');
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP': return 'bg-green-100 text-green-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">TrackAS Admin Dashboard</h1>
        <p className="text-gray-600">Complete platform control and monitoring</p>
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

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Bell className="h-5 w-5 text-red-500 mr-2" />
              System Alerts
            </h3>
            <div className="space-y-2">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">{formatDate(alert.timestamp)}</p>
                      {alert.actionRequired && (
                        <span className="inline-block px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full mt-1">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+12%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Daily Commission</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.dailyCommission)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+15%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              <div className="flex items-center mt-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 ml-1">{stats.avgApprovalTime}h avg</span>
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
              <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
              <p className="text-xl font-bold text-blue-600">{stats.onTimeDelivery}%</p>
              <p className="text-sm text-gray-500">Target: ≥95%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dispute Rate</p>
              <p className="text-xl font-bold text-red-600">{stats.disputeRate}%</p>
              <p className="text-sm text-gray-500">Target: ≤2%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Escrow Held</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.escrowHeld)}</p>
              <p className="text-sm text-gray-500">Active shipments</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'approvals', label: 'User Approvals', icon: UserCheck },
              { id: 'shipments', label: 'Shipment Control', icon: Package },
              { id: 'financial', label: 'Financial Console', icon: DollarSign },
              { id: 'analytics', label: 'System Analytics', icon: PieChart },
              { id: 'config', label: 'Configuration', icon: Settings }
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
                <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Approve Users</p>
                <p className="text-sm text-blue-700">{stats.pendingApprovals} pending</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Manage Shipments</p>
                <p className="text-sm text-green-700">{stats.activeShipments} active</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Financial Console</p>
                <p className="text-sm text-purple-700">View escrow & payments</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Settings className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">System Config</p>
                <p className="text-sm text-orange-700">Update settings</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activeShipments.slice(0, 5).map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{shipment.id}</p>
                      <p className="text-sm text-gray-600">{shipment.shipperName}</p>
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

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending User Approvals</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{approval.name}</div>
                        <div className="text-sm text-gray-500">{approval.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {approval.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                        {approval.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(approval.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{approval.documents.length} docs</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveUser(approval.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRejectUser(approval.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <UserX className="h-4 w-4" />
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

      {activeTab === 'shipments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Shipments Control Tower</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipper
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shipment.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shipment.shipperName}</div>
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
                      {shipment.eta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Track">
                          <MapPin className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Override">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900" title="Cancel">
                          <XCircle className="h-4 w-4" />
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

      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escrow Held</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.escrowHeld)}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Commission</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.dailyCommission)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Financial Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Unlock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Release Escrow</p>
                <p className="text-sm text-green-700">Manual release</p>
              </button>
              <button className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Lock className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium text-red-900">Hold Funds</p>
                <p className="text-sm text-red-700">Dispute resolution</p>
              </button>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Generate Reports</p>
                <p className="text-sm text-blue-700">Financial reports</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Export Data</p>
                <p className="text-sm text-purple-700">Audit logs</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Acceptance Rate</span>
                  <span className="font-medium text-green-600">{stats.acceptanceRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">On-Time Delivery</span>
                  <span className="font-medium text-blue-600">{stats.onTimeDelivery}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dispute Rate</span>
                  <span className="font-medium text-red-600">{stats.disputeRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Approval Time</span>
                  <span className="font-medium text-orange-600">{stats.avgApprovalTime}h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Fleets</span>
                  <span className="font-medium text-blue-600">{stats.activeFleets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Shippers</span>
                  <span className="font-medium text-green-600">{stats.activeShippers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Approvals</span>
                  <span className="font-medium text-orange-600">{stats.pendingApprovals}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Configuration Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Basic Tier</span>
                  <span className="font-medium text-gray-900">7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Premium Tier</span>
                  <span className="font-medium text-blue-600">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Enterprise Tier</span>
                  <span className="font-medium text-purple-600">3%</span>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Commission Rates
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Escrow Hold Period</span>
                  <span className="font-medium text-gray-900">3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assignment Timeout</span>
                  <span className="font-medium text-gray-900">2 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dispute Resolution SLA</span>
                  <span className="font-medium text-gray-900">3 days</span>
                </div>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Update System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;