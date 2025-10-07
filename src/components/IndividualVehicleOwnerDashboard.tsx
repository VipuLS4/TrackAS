import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  DollarSign, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Star, 
  Plus, 
  Eye, 
  Phone, 
  Mail, 
  Settings, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity,
  Shield,
  CreditCard,
  Download,
  RefreshCw,
  Navigation,
  Camera,
  Edit
} from 'lucide-react';

interface IndividualStats {
  monthlyEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  acceptanceRate: number;
  onTimeCompletion: number;
  avgRating: number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  vehicleStatus: string;
  documentStatus: string;
}

interface JobOffer {
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
  distance: number;
  estimatedDuration: number;
  expiresAt: string;
}

interface TripHistory {
  id: string;
  shipmentId: string;
  shipperName: string;
  route: string;
  price: number;
  status: string;
  completedAt: string;
  rating: number;
  feedback?: string;
}

interface Document {
  id: string;
  type: string;
  number: string;
  expiryDate: string;
  status: string;
  daysToExpiry: number;
}

const IndividualVehicleOwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<IndividualStats>({
    monthlyEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0,
    acceptanceRate: 0,
    onTimeCompletion: 0,
    avgRating: 0,
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    vehicleStatus: 'AVAILABLE',
    documentStatus: 'VALID'
  });
  
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await loadStats();
      await loadJobOffers();
      await loadTripHistory();
      await loadDocuments();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const mockStats: IndividualStats = {
        monthlyEarnings: 85000,
        todayEarnings: 3200,
        weeklyEarnings: 18500,
        acceptanceRate: 78.5,
        onTimeCompletion: 92.3,
        avgRating: 4.7,
        totalJobs: 45,
        completedJobs: 42,
        activeJobs: 1,
        vehicleStatus: 'AVAILABLE',
        documentStatus: 'VALID'
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadJobOffers = async () => {
    try {
      const mockOffers: JobOffer[] = [
        {
          id: 'JOB-001',
          shipperName: 'ABC Manufacturing',
          pickupLocation: 'Mumbai, Maharashtra',
          dropLocation: 'Pune, Maharashtra',
          consignmentDetails: {
            items: 'Electronics',
            weight: 200,
            volume: 1.2
          },
          price: 8500,
          urgency: 'normal',
          pickupTime: '2024-01-15T14:00:00Z',
          distance: 150,
          estimatedDuration: 3,
          expiresAt: '2024-01-15T14:05:00Z'
        },
        {
          id: 'JOB-002',
          shipperName: 'XYZ Logistics',
          pickupLocation: 'Delhi, Delhi',
          dropLocation: 'Gurgaon, Haryana',
          consignmentDetails: {
            items: 'Textile Goods',
            weight: 300,
            volume: 2.0
          },
          price: 12000,
          urgency: 'express',
          pickupTime: '2024-01-15T16:00:00Z',
          distance: 30,
          estimatedDuration: 1,
          expiresAt: '2024-01-15T16:05:00Z'
        }
      ];
      setJobOffers(mockOffers);
    } catch (error) {
      console.error('Error loading job offers:', error);
    }
  };

  const loadTripHistory = async () => {
    try {
      const mockHistory: TripHistory[] = [
        {
          id: 'TRIP-001',
          shipmentId: 'SHIP-001',
          shipperName: 'PQR Industries',
          route: 'Bangalore → Chennai',
          price: 15000,
          status: 'COMPLETED',
          completedAt: '2024-01-14T18:30:00Z',
          rating: 5,
          feedback: 'Excellent service, on-time delivery'
        },
        {
          id: 'TRIP-002',
          shipmentId: 'SHIP-002',
          shipperName: 'DEF Corp',
          route: 'Mumbai → Ahmedabad',
          price: 18000,
          status: 'COMPLETED',
          completedAt: '2024-01-13T15:45:00Z',
          rating: 4,
          feedback: 'Good service, minor delay'
        }
      ];
      setTripHistory(mockHistory);
    } catch (error) {
      console.error('Error loading trip history:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const mockDocuments: Document[] = [
        {
          id: 'DOC-001',
          type: 'Vehicle RC',
          number: 'MH-01-AB-1234',
          expiryDate: '2025-12-31',
          status: 'VALID',
          daysToExpiry: 350
        },
        {
          id: 'DOC-002',
          type: 'Insurance',
          number: 'INS-789456123',
          expiryDate: '2024-03-15',
          status: 'EXPIRING_SOON',
          daysToExpiry: 60
        },
        {
          id: 'DOC-003',
          type: 'Pollution Certificate',
          number: 'PUC-456789123',
          expiryDate: '2024-02-28',
          status: 'EXPIRING_SOON',
          daysToExpiry: 45
        }
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Job ${jobId} accepted! Please proceed to pickup location.`);
      loadJobOffers();
    } catch (error) {
      alert('Failed to accept job');
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    if (confirm('Are you sure you want to decline this job?')) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Job ${jobId} declined`);
        loadJobOffers();
      } catch (error) {
        alert('Failed to decline job');
      }
    }
  };

  const handleMarkArrived = async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Marked arrived at pickup location for ${jobId}`);
    } catch (error) {
      alert('Failed to mark arrived');
    }
  };

  const handleMarkPickedUp = async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Marked picked up for ${jobId}`);
    } catch (error) {
      alert('Failed to mark picked up');
    }
  };

  const handleMarkDelivered = async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Marked delivered for ${jobId}. Please upload POD.`);
    } catch (error) {
      alert('Failed to mark delivered');
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
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'VALID': return 'bg-green-100 text-green-800';
      case 'EXPIRING_SOON': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Individual Vehicle Owner Dashboard</h1>
        <p className="text-gray-600">Manage your vehicle operations and earnings</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayEarnings)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+8% vs yesterday</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              <div className="flex items-center mt-1">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 ml-1">In progress</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On-Time Completion</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeCompletion}%</p>
              <div className="flex items-center mt-1">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 ml-1">Target: ≥90%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}⭐</p>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-600 ml-1">Excellent</span>
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
              <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.monthlyEarnings)}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
              <p className="text-xl font-bold text-blue-600">{stats.acceptanceRate}%</p>
              <p className="text-sm text-gray-500">Job acceptance</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalJobs}</p>
              <p className="text-sm text-gray-500">{stats.completedJobs} completed</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Status</p>
              <p className="text-xl font-bold text-orange-600">{stats.vehicleStatus}</p>
              <p className="text-sm text-gray-500">Ready for jobs</p>
            </div>
            <Truck className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Vehicle & Document Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Vehicle Status</h3>
                <p className="text-sm text-gray-600">IND-593204</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.vehicleStatus)}`}>
              {stats.vehicleStatus}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Document Status</h3>
                <p className="text-sm text-gray-600">Compliance check</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.documentStatus)}`}>
              {stats.documentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'jobs', label: 'Job Feed', icon: Package },
              { id: 'earnings', label: 'My Earnings', icon: DollarSign },
              { id: 'trips', label: 'Trip History', icon: MapPin },
              { id: 'documents', label: 'Document Tracker', icon: FileText },
              { id: 'profile', label: 'Profile', icon: Settings }
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
                <p className="font-medium text-blue-900">View Job Feed</p>
                <p className="text-sm text-blue-700">{jobOffers.length} available</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-green-900">Active Trip</p>
                <p className="text-sm text-green-700">{stats.activeJobs} in progress</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Earnings</p>
                <p className="text-sm text-purple-700">View settlements</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">Documents</p>
                <p className="text-sm text-orange-700">Check expiry</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {tripHistory.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{trip.shipmentId}</p>
                      <p className="text-sm text-gray-600">{trip.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(trip.price)}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 ml-1">{trip.rating}⭐</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Available Job Feed (FCFS)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
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
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobOffers.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.id}</div>
                        <div className="text-sm text-gray-500">{job.consignmentDetails.items}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.shipperName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.pickupLocation} → {job.dropLocation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(job.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.distance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptJob(job.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Accept Job"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeclineJob(job.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Decline Job"
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
                <p className="font-medium text-green-900">Settlement History</p>
                <p className="text-sm text-green-700">Payment records</p>
              </button>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-900">Download Reports</p>
                <p className="text-sm text-blue-700">Earnings reports</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-purple-900">Bank Details</p>
                <p className="text-sm text-purple-700">Payment settings</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-orange-900">Performance</p>
                <p className="text-sm text-orange-700">Earnings analytics</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Trip History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripHistory.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.shipmentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.shipperName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.route}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(trip.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-900 ml-1">{trip.rating}⭐</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(trip.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Tracker</h3>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.type}</h4>
                      <p className="text-sm text-gray-600">{doc.number}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {doc.daysToExpiry > 0 ? `${doc.daysToExpiry} days left` : 'Expired'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Expires: {formatDate(doc.expiryDate)}</p>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Upload New
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Personal Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">Rajesh Kumar</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">+91 98765 43210</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">rajesh.kumar@email.com</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vehicle Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle VCODE</label>
                    <p className="mt-1 text-sm text-gray-900">IND-593204</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                    <p className="mt-1 text-sm text-gray-900">Truck</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <p className="mt-1 text-sm text-gray-900">500 kg</p>
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
        </div>
      )}
    </div>
  );
};

export default IndividualVehicleOwnerDashboard;
