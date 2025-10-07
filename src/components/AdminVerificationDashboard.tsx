import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Download, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Truck,
  Building2,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  Star
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  user_type: 'shipper' | 'fleet' | 'individual';
  vcode?: string;
  status: 'pending_verification' | 'verified_pending_approval' | 'approved' | 'rejected' | 'active';
  rejection_reason?: string;
  verified_at?: string;
  approved_at?: string;
  activated_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface VerificationLog {
  id: string;
  verification_type: string;
  verification_status: string;
  verification_result?: any;
  verified_by: string;
  verified_at: string;
  failure_reason?: string;
}

interface RejectionLog {
  id: string;
  rejection_reason: string;
  rejection_details?: any;
  rejected_by: string;
  rejected_at: string;
}

const AdminVerificationDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>([]);
  const [rejectionLogs, setRejectionLogs] = useState<RejectionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionDetails, setRejectionDetails] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, filter, searchTerm]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // Simulate API call to load profiles
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfiles: UserProfile[] = [
        {
          id: '1',
          user_id: 'user1',
          user_type: 'shipper',
          status: 'verified_pending_approval',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          user_email: 'shipper@example.com',
          user_name: 'ABC Logistics Pvt Ltd'
        },
        {
          id: '2',
          user_id: 'user2',
          user_type: 'fleet',
          status: 'pending_verification',
          created_at: '2024-01-14T15:30:00Z',
          updated_at: '2024-01-14T15:30:00Z',
          user_email: 'fleet@example.com',
          user_name: 'XYZ Transport Company'
        },
        {
          id: '3',
          user_id: 'user3',
          user_type: 'individual',
          status: 'verified_pending_approval',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          user_email: 'driver@example.com',
          user_name: 'Rajesh Kumar'
        },
        {
          id: '4',
          user_id: 'user4',
          user_type: 'shipper',
          status: 'rejected',
          rejection_reason: 'Invalid PAN document',
          created_at: '2024-01-12T14:20:00Z',
          updated_at: '2024-01-12T14:20:00Z',
          user_email: 'rejected@example.com',
          user_name: 'DEF Trading Co'
        },
        {
          id: '5',
          user_id: 'user5',
          user_type: 'fleet',
          vcode: 'FLEET-123456',
          status: 'active',
          approved_at: '2024-01-10T11:45:00Z',
          activated_at: '2024-01-10T11:45:00Z',
          created_at: '2024-01-10T08:30:00Z',
          updated_at: '2024-01-10T11:45:00Z',
          user_email: 'active@example.com',
          user_name: 'Active Fleet Ltd'
        }
      ];
      
      setProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(profile => profile.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.vcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  };

  const loadVerificationLogs = async (profileId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockLogs: VerificationLog[] = [
        {
          id: '1',
          verification_type: 'pan',
          verification_status: 'verified',
          verified_by: 'system',
          verified_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          verification_type: 'document_integrity',
          verification_status: 'verified',
          verified_by: 'system',
          verified_at: '2024-01-15T10:35:00Z'
        }
      ];
      
      setVerificationLogs(mockLogs);
    } catch (error) {
      console.error('Error loading verification logs:', error);
    }
  };

  const handleApprove = async (profileId: string) => {
    try {
      // Simulate API call to approve profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfiles(prev => prev.map(profile => 
        profile.id === profileId 
          ? { 
              ...profile, 
              status: 'active' as const,
              vcode: generateVCODE(profile.user_type),
              approved_at: new Date().toISOString(),
              activated_at: new Date().toISOString()
            }
          : profile
      ));
      
      alert('Profile approved successfully!');
    } catch (error) {
      console.error('Error approving profile:', error);
      alert('Failed to approve profile');
    }
  };

  const handleReject = async () => {
    if (!selectedProfile || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      // Simulate API call to reject profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfiles(prev => prev.map(profile => 
        profile.id === selectedProfile.id 
          ? { 
              ...profile, 
              status: 'rejected' as const,
              rejection_reason: rejectionReason
            }
          : profile
      ));
      
      setShowRejectionModal(false);
      setRejectionReason('');
      setRejectionDetails('');
      alert('Profile rejected successfully!');
    } catch (error) {
      console.error('Error rejecting profile:', error);
      alert('Failed to reject profile');
    }
  };

  const generateVCODE = (userType: string): string => {
    const prefixes = {
      shipper: 'SHP-',
      fleet: 'FLEET-',
      individual: 'IND-'
    };
    
    const prefix = prefixes[userType as keyof typeof prefixes] || 'USR-';
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return prefix + randomNumber;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'verified_pending_approval': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_verification': return <Clock className="h-4 w-4" />;
      case 'verified_pending_approval': return <UserCheck className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'shipper': return <Building2 className="h-5 w-5" />;
      case 'fleet': return <Truck className="h-5 w-5" />;
      case 'individual': return <User className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
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

  const getStats = () => {
    const total = profiles.length;
    const pending = profiles.filter(p => p.status === 'pending_verification').length;
    const verified = profiles.filter(p => p.status === 'verified_pending_approval').length;
    const active = profiles.filter(p => p.status === 'active').length;
    const rejected = profiles.filter(p => p.status === 'rejected').length;

    return { total, pending, verified, active, rejected };
  };

  const stats = getStats();

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Dashboard</h1>
        <p className="text-gray-600">Review and approve user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
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
                placeholder="Search by name, email, or VCODE..."
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
              <option value="pending_verification">Pending Verification</option>
              <option value="verified_pending_approval">Verified Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
            </select>
            <button
              onClick={loadProfiles}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
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
                  VCODE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {profile.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {profile.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getUserTypeIcon(profile.user_type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {profile.user_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                      {getStatusIcon(profile.status)}
                      <span className="ml-1 capitalize">
                        {profile.status.replace('_', ' ')}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {profile.vcode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProfile(profile);
                          loadVerificationLogs(profile.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                      {profile.status === 'verified_pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(profile.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProfile(profile);
                              setShowRejectionModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Review Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Review Profile - {selectedProfile.user_name}
              </h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedProfile.user_email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Registered: {formatDate(selectedProfile.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Status: {selectedProfile.status.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedProfile.vcode && (
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">VCODE: {selectedProfile.vcode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Logs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Verification Logs</h3>
                <div className="space-y-2">
                  {verificationLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {log.verification_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          log.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.verification_status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(log.verified_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedProfile.status === 'verified_pending_approval' && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedProfile(null);
                    setShowRejectionModal(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedProfile.id);
                    setSelectedProfile(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter rejection reason"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={rejectionDetails}
                  onChange={(e) => setRejectionDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Additional details (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setRejectionDetails('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationDashboard;
