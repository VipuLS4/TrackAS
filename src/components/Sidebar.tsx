import React from 'react';
import { 
  Home, 
  Package, 
  MapPin, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Truck,
  Clock,
  CheckCircle,
  FileText,
  Shield,
  Globe,
  Brain,
  AlertTriangle,
  Download,
  Star,
  Search,
  UserPlus,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'shipper' | 'fleet' | 'individual';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, userRole }) => {
  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Dashboard', icon: Home },
          { id: 'approvals', label: 'Shipment Approvals', icon: CheckCircle },
          { id: 'verification', label: 'User Verification', icon: Shield },
          { id: 'shipments', label: 'Shipment Management', icon: Package },
          { id: 'payments', label: 'Payment Management', icon: CreditCard },
          { id: 'subscriptions', label: 'Fleet Subscriptions', icon: Users },
          { id: 'disputes', label: 'Dispute Management', icon: AlertTriangle },
          { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
          { id: 'ai-insights', label: 'AI Insights', icon: Brain },
          { id: 'anomaly-detection', label: 'Anomaly Detection', icon: Activity },
          { id: 'demand-forecasting', label: 'Demand Forecasting', icon: TrendingUp },
          { id: 'unified-registration', label: 'Registration Portal', icon: UserPlus },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ];
      case 'shipper':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'create-shipment', label: 'Create Shipment', icon: Package },
          { id: 'my-shipments', label: 'My Shipments', icon: Package },
          { id: 'tracking', label: 'Tracking', icon: MapPin },
          { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
          { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
        ];
      case 'fleet':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'requests', label: 'Priority Requests', icon: Package },
          { id: 'fleet-tracker', label: 'Fleet Tracker', icon: Truck },
          { id: 'earnings', label: 'Earnings Dashboard', icon: CreditCard },
          { id: 'maintenance', label: 'Maintenance & Compliance', icon: Settings },
          { id: 'fleet-management', label: 'Fleet Management', icon: Users },
          { id: 'subscriptions', label: 'Subscriptions', icon: Star },
        ];
      case 'individual':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'jobs', label: 'Job Feed (FCFS)', icon: Package },
          { id: 'earnings', label: 'My Earnings', icon: CreditCard },
          { id: 'trips', label: 'Trip History', icon: MapPin },
          { id: 'documents', label: 'Document Tracker', icon: FileText },
          { id: 'profile', label: 'Profile', icon: Settings },
          { id: 'driver-app', label: 'Driver App', icon: Truck },
          { id: 'available-jobs', label: 'Available Jobs', icon: Package },
          { id: 'feedback', label: 'Feedback & Ratings', icon: Star },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <img 
                src="/Vipul.png" 
                alt="Vipul Sharma" 
                className="h-8 w-8 rounded-full object-cover border border-purple-200"
              />
              <div>
                <p className="text-xs font-medium text-purple-900 mb-1">Vipul Sharma</p>
              <p className="text-xs font-medium text-purple-900 mb-1">Founder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;