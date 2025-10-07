import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Star, 
  Zap, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Plus,
  Trash2,
  Eye,
  Settings
} from 'lucide-react';
import PaymentService from '../services/paymentService';

interface SubscriptionPlan {
  id: string;
  tier: 'basic' | 'premium' | 'enterprise';
  name: string;
  description: string;
  monthlyFee: number;
  quarterlyFee: number;
  yearlyFee: number;
  features: string[];
  benefits: {
    priorityMatching: number;
    commissionReduction: number;
    analyticsAccess: string[];
    dedicatedSupport: boolean;
  };
  isActive: boolean;
}

interface FleetSubscription {
  id: string;
  fleetId: string;
  fleetName: string;
  subscriptionTier: string;
  billingCycle: string;
  feeAmount: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  gracePeriodEnd?: string;
  autoRenew: boolean;
  createdAt: string;
}

const FleetSubscriptionManagement: React.FC = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [fleetSubscriptions, setFleetSubscriptions] = useState<FleetSubscription[]>([]);
  const [activeTab, setActiveTab] = useState('plans');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const paymentService = PaymentService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadSubscriptionPlans();
      await loadFleetSubscriptions();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      // Mock subscription plans
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'basic',
          tier: 'basic',
          name: 'Basic Plan',
          description: 'Essential features for small fleets',
          monthlyFee: 0,
          quarterlyFee: 0,
          yearlyFee: 0,
          features: [
            'Standard matching priority',
            'Basic analytics',
            'Email support',
            'Up to 10 vehicles'
          ],
          benefits: {
            priorityMatching: 1,
            commissionReduction: 0,
            analyticsAccess: ['basic_metrics'],
            dedicatedSupport: false
          },
          isActive: true
        },
        {
          id: 'premium',
          tier: 'premium',
          name: 'Premium Plan',
          description: 'Advanced features for growing fleets',
          monthlyFee: 5000,
          quarterlyFee: 12000,
          yearlyFee: 40000,
          features: [
            'Priority matching (2x)',
            'Advanced analytics',
            'Phone support',
            'Up to 50 vehicles',
            '2% commission reduction',
            'Custom reporting'
          ],
          benefits: {
            priorityMatching: 2,
            commissionReduction: 2,
            analyticsAccess: ['basic_metrics', 'performance_metrics', 'custom_reports'],
            dedicatedSupport: false
          },
          isActive: true
        },
        {
          id: 'enterprise',
          tier: 'enterprise',
          name: 'Enterprise Plan',
          description: 'Full-featured solution for large fleets',
          monthlyFee: 15000,
          quarterlyFee: 40000,
          yearlyFee: 120000,
          features: [
            'Highest priority matching (3x)',
            'Full analytics suite',
            'Dedicated account manager',
            'Unlimited vehicles',
            '4% commission reduction',
            'API access',
            'Custom integrations',
            'Priority dispute resolution'
          ],
          benefits: {
            priorityMatching: 3,
            commissionReduction: 4,
            analyticsAccess: ['basic_metrics', 'performance_metrics', 'custom_reports', 'api_access'],
            dedicatedSupport: true
          },
          isActive: true
        }
      ];
      
      setSubscriptionPlans(mockPlans);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const loadFleetSubscriptions = async () => {
    try {
      // Mock fleet subscriptions
      const mockSubscriptions: FleetSubscription[] = [
        {
          id: 'SUB-001',
          fleetId: 'fleet1',
          fleetName: 'ABC Transport Ltd',
          subscriptionTier: 'enterprise',
          billingCycle: 'monthly',
          feeAmount: 15000,
          status: 'ACTIVE',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-02-01T00:00:00Z',
          nextBillingDate: '2024-02-01T00:00:00Z',
          autoRenew: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'SUB-002',
          fleetId: 'fleet2',
          fleetName: 'XYZ Logistics',
          subscriptionTier: 'premium',
          billingCycle: 'quarterly',
          feeAmount: 12000,
          status: 'ACTIVE',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-04-01T00:00:00Z',
          nextBillingDate: '2024-04-01T00:00:00Z',
          autoRenew: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'SUB-003',
          fleetId: 'fleet3',
          fleetName: 'Quick Delivery Co',
          subscriptionTier: 'basic',
          billingCycle: 'monthly',
          feeAmount: 0,
          status: 'ACTIVE',
          currentPeriodStart: '2024-01-01T00:00:00Z',
          currentPeriodEnd: '2024-02-01T00:00:00Z',
          nextBillingDate: '2024-02-01T00:00:00Z',
          autoRenew: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      
      setFleetSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Error loading fleet subscriptions:', error);
    }
  };

  const handleCreateSubscription = async (
    fleetId: string,
    tier: string,
    billingCycle: string
  ) => {
    try {
      const plan = subscriptionPlans.find(p => p.tier === tier);
      if (!plan) return;

      let feeAmount = 0;
      switch (billingCycle) {
        case 'monthly':
          feeAmount = plan.monthlyFee;
          break;
        case 'quarterly':
          feeAmount = plan.quarterlyFee;
          break;
        case 'yearly':
          feeAmount = plan.yearlyFee;
          break;
      }

      await paymentService.createFleetSubscription(fleetId, tier, billingCycle, feeAmount, 'per_fleet');
      alert('Subscription created successfully!');
      loadFleetSubscriptions();
    } catch (error) {
      alert('Failed to create subscription');
    }
  };

  const handleRenewSubscription = async (subscriptionId: string) => {
    try {
      const success = await paymentService.processSubscriptionPayment(subscriptionId);
      if (success) {
        alert('Subscription renewed successfully!');
        loadFleetSubscriptions();
      } else {
        alert('Failed to renew subscription');
      }
    } catch (error) {
      alert('Error renewing subscription');
    }
  };

  const handleSuspendSubscription = async (subscriptionId: string) => {
    if (confirm('Are you sure you want to suspend this subscription?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Subscription suspended');
        loadFleetSubscriptions();
      } catch (error) {
        alert('Failed to suspend subscription');
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
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fleet Subscription Management</h1>
        <p className="text-gray-600">Manage subscription plans and fleet subscriptions</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'plans', label: 'Subscription Plans', icon: Settings },
              { id: 'subscriptions', label: 'Fleet Subscriptions', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Plans Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(plan.tier)}`}>
                    {plan.tier.toUpperCase()}
                  </span>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(plan.monthlyFee)}
                    </span>
                    <span className="text-sm text-gray-600">/month</span>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Quarterly: {formatCurrency(plan.quarterlyFee)} | 
                    Yearly: {formatCurrency(plan.yearlyFee)}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                      Priority Level: {plan.benefits.priorityMatching}x
                    </div>
                    {plan.benefits.commissionReduction > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        Commission Reduction: {plan.benefits.commissionReduction}%
                      </div>
                    )}
                    {plan.benefits.dedicatedSupport && (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-500 mr-2" />
                        Dedicated Support
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowEditPlan(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create New Plan Button */}
          <div className="text-center">
            <button
              onClick={() => setShowCreatePlan(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Fleet Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Fleet Subscriptions</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Subscription</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fleet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
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
                {fleetSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subscription.fleetName}</div>
                        <div className="text-sm text-gray-500">{subscription.fleetId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(subscription.subscriptionTier)}`}>
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
                        <button
                          onClick={() => handleRenewSubscription(subscription.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Renew"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSuspendSubscription(subscription.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Suspend"
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Subscription Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{fleetSubscriptions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(fleetSubscriptions.reduce((sum, s) => sum + s.feeAmount, 0))}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">68%</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Retention</p>
                  <p className="text-2xl font-bold text-gray-900">8.2 months</p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['basic', 'premium', 'enterprise'].map((tier) => {
                const count = fleetSubscriptions.filter(s => s.subscriptionTier === tier).length;
                const percentage = fleetSubscriptions.length > 0 ? (count / fleetSubscriptions.length) * 100 : 0;
                
                return (
                  <div key={tier} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{tier} Plan</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              {['basic', 'premium', 'enterprise'].map((tier) => {
                const subscriptions = fleetSubscriptions.filter(s => s.subscriptionTier === tier);
                const revenue = subscriptions.reduce((sum, s) => sum + s.feeAmount, 0);
                
                return (
                  <div key={tier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(tier)}`}>
                        {tier.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{subscriptions.length} subscribers</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(revenue)}</div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetSubscriptionManagement;
