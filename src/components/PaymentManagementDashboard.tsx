import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Package, 
  RefreshCw, 
  Download, 
  Eye, 
  Edit, 
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap
} from 'lucide-react';
import PaymentService from '../services/paymentService';

interface PaymentStats {
  totalCommission: number;
  totalEscrowHeld: number;
  totalSettlements: number;
  totalRefunds: number;
  subscriptionRevenue: number;
  paymentFailures: number;
  dailyData: any[];
}

interface PaymentTransaction {
  id: string;
  shipmentId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

interface RefundRequest {
  id: string;
  shipmentId: string;
  requestedBy: string;
  requestType: string;
  amountRequested: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface FleetSubscription {
  id: string;
  fleetId: string;
  subscriptionTier: string;
  billingCycle: string;
  feeAmount: number;
  status: string;
  nextBillingDate: string;
}

const PaymentManagementDashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats>({
    totalCommission: 0,
    totalEscrowHeld: 0,
    totalSettlements: 0,
    totalRefunds: 0,
    subscriptionRevenue: 0,
    paymentFailures: 0,
    dailyData: []
  });
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [subscriptions, setSubscriptions] = useState<FleetSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [filter, setFilter] = useState('all');

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Load analytics
      const analytics = await paymentService.getPaymentAnalytics(
        startDate.toISOString().split('T')[0],
        endDate
      );
      setStats(analytics);

      // Load recent transactions
      const recentTransactions = await paymentService.getPaymentHistory();
      setTransactions(recentTransactions.slice(0, 50));

      // Load refund requests
      await loadRefundRequests();

      // Load subscriptions
      await loadSubscriptions();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRefundRequests = async () => {
    try {
      // Simulate API call
      const mockRefunds: RefundRequest[] = [
        {
          id: 'REF-001',
          shipmentId: 'SHIP-001',
          requestedBy: 'shipper1',
          requestType: 'CANCELLATION',
          amountRequested: 15000,
          reason: 'Shipment cancelled before pickup',
          status: 'PENDING',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'REF-002',
          shipmentId: 'SHIP-002',
          requestedBy: 'shipper2',
          requestType: 'DISPUTE',
          amountRequested: 8000,
          reason: 'Package damaged during transit',
          status: 'APPROVED',
          createdAt: '2024-01-14T15:30:00Z'
        }
      ];
      setRefundRequests(mockRefunds);
    } catch (error) {
      console.error('Error loading refund requests:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      // Simulate API call
      const mockSubscriptions: FleetSubscription[] = [
        {
          id: 'SUB-001',
          fleetId: 'fleet1',
          subscriptionTier: 'enterprise',
          billingCycle: 'monthly',
          feeAmount: 5000,
          status: 'ACTIVE',
          nextBillingDate: '2024-02-15T00:00:00Z'
        },
        {
          id: 'SUB-002',
          fleetId: 'fleet2',
          subscriptionTier: 'premium',
          billingCycle: 'quarterly',
          feeAmount: 12000,
          status: 'ACTIVE',
          nextBillingDate: '2024-04-01T00:00:00Z'
        }
      ];
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleApproveRefund = async (requestId: string) => {
    try {
      const success = await paymentService.approveRefundRequest(requestId, 'admin');
      if (success) {
        alert('Refund approved successfully!');
        loadRefundRequests();
      } else {
        alert('Failed to approve refund');
      }
    } catch (error) {
      alert('Error approving refund');
    }
  };

  const handleRejectRefund = async (requestId: string) => {
    if (confirm('Are you sure you want to reject this refund request?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Refund request rejected');
        loadRefundRequests();
      } catch (error) {
        alert('Error rejecting refund');
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
      case 'COMPLETE': return 'bg-green-100 text-green-800';
      case 'HELD': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-purple-100 text-purple-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ESCROW_IN': return <Wallet className="h-4 w-4" />;
      case 'COMMISSION': return <DollarSign className="h-4 w-4" />;
      case 'SETTLEMENT': return <ArrowUpRight className="h-4 w-4" />;
      case 'REFUND': return <ArrowDownRight className="h-4 w-4" />;
      case 'SUBSCRIPTION': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Management Dashboard</h1>
        <p className="text-gray-600">Monitor and manage all payment transactions, escrow, and subscriptions</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommission)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+12%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Escrow Held</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEscrowHeld)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 ml-1">+8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ArrowUpRight className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Settlements</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSettlements)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 ml-1">+15%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subscription Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.subscriptionRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 ml-1">+22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunds</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalRefunds)}</p>
              <p className="text-sm text-gray-500">2.3% of total volume</p>
            </div>
            <ArrowDownRight className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Failures</p>
              <p className="text-xl font-bold text-yellow-600">{stats.paymentFailures}</p>
              <p className="text-sm text-gray-500">1.2% failure rate</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'refunds', label: 'Refunds', icon: ArrowDownRight },
              { id: 'subscriptions', label: 'Subscriptions', icon: Users }
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
          {/* Payment Flow Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Flow Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Shipper Pays</p>
                <p className="text-sm text-blue-700">Shipment + Commission</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Wallet className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-yellow-900">Escrow Held</p>
                <p className="text-sm text-yellow-700">T+3 days</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Delivery Confirmed</p>
                <p className="text-sm text-green-700">POD Verified</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <ArrowUpRight className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Settlement</p>
                <p className="text-sm text-purple-700">Fleet Receives</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">Shipment: {transaction.shipmentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment Transactions</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="ESCROW_IN">Escrow In</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="SETTLEMENT">Settlement</option>
                  <option value="REFUND">Refund</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
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
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                        <div className="text-sm text-gray-500">{transaction.shipmentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-sm text-gray-900">{transaction.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Refund Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
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
                {refundRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.id}</div>
                        <div className="text-sm text-gray-500">{request.shipmentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{request.requestType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(request.amountRequested)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveRefund(request.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRefund(request.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          </>
                        )}
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

      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Fleet Subscriptions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fleet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscription.fleetId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subscription.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.billingCycle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(subscription.feeAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.nextBillingDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Renew">
                          <RefreshCw className="h-4 w-4" />
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
    </div>
  );
};

export default PaymentManagementDashboard;
