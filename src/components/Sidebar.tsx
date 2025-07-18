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
  Globe
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'logistics' | 'operator' | 'customer';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, userRole }) => {
  const getMenuItems = () => {
    switch (userRole) {
      case 'logistics':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'create-shipment', label: 'Create Shipment', icon: Package },
          { id: 'tracking', label: 'Live Tracking', icon: MapPin },
          { id: 'operators', label: 'Manage Operators', icon: Users },
          { id: 'billing', label: 'Billing', icon: CreditCard },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'company-registration', label: 'Company Registration', icon: FileText },
          { id: 'vehicle-registration', label: 'Vehicle Registration', icon: Truck },
          { id: 'verification', label: 'Verification Dashboard', icon: Shield },
          { id: 'operational-flow', label: 'Operational Flow', icon: Globe },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'operator':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'available-jobs', label: 'Available Jobs', icon: Package },
          { id: 'active-shipments', label: 'Active Shipments', icon: Truck },
          { id: 'tracking', label: 'Live Tracking', icon: MapPin },
          { id: 'earnings', label: 'Earnings', icon: CreditCard },
          { id: 'operational-flow', label: 'Operational Flow', icon: Globe },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'customer':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'my-shipments', label: 'My Shipments', icon: Package },
          { id: 'tracking', label: 'Track Shipment', icon: MapPin },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'operational-flow', label: 'Operational Flow', icon: Globe },
          { id: 'settings', label: 'Settings', icon: Settings },
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