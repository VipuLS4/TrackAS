import React, { useState, useEffect } from 'react';
import { AppProvider } from '../context/AppContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DatabaseProvider } from '../context/DatabaseContext';
import MarketingLoginPage from './MarketingLoginPage';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import CreateShipment from './CreateShipment';
import LiveTracking from './LiveTracking';
import LiveTrackingMap from './LiveTrackingMap';
import Analytics from './Analytics';
import OperatorManagement from './OperatorManagement';
import ShipmentApproval from './ShipmentApproval';
import AIRouteOptimizer from './AIRouteOptimizer';
import CompanyRegistration from './CompanyRegistration';
import VehicleRegistration from './VehicleRegistration';
import VerificationDashboard from './VerificationDashboard';
import AvailableJobs from './AvailableJobs';
import CustomerShipments from './CustomerShipments';
import InvoiceManagement from './InvoiceManagement';
import DisputeManagement from './DisputeManagement';
import AIInsightsDashboard from './AIInsightsDashboard';
import AnomalyDetection from './AnomalyDetection';
import DemandForecasting from './DemandForecasting';
import UnifiedRegistration from './UnifiedRegistration';
import DedicatedLoginPages from './DedicatedLoginPages';
import PredictiveETA from './PredictiveETA';
import CustomerTrackingPortal from './CustomerTrackingPortal';
import AdminVerificationDashboard from './AdminVerificationDashboard';
import AdminShipmentDashboard from './AdminShipmentDashboard';
import DriverApp from './DriverApp';
import FeedbackAndRatings from './FeedbackAndRatings';
import ShipperDashboard from './ShipperDashboard';
import FleetOperatorDashboard from './FleetOperatorDashboard';
import IndividualVehicleOwnerDashboard from './IndividualVehicleOwnerDashboard';
import PaymentManagementDashboard from './PaymentManagementDashboard';
import FleetSubscriptionManagement from './FleetSubscriptionManagement';
import AIAssistant from './AIAssistant';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'shipper' | 'fleet' | 'individual' | 'operator' | 'customer' | 'logistics' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setUserRole(authState.user.role);
    }
  }, [authState]);

  const handleLogin = (role: 'admin' | 'shipper' | 'fleet' | 'individual' | 'operator' | 'customer' | 'logistics') => {
    setUserRole(role);
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    // Admin-specific content
    if (userRole === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'approvals':
          return <ShipmentApproval userRole="admin" />;
        case 'verification':
          return <AdminVerificationDashboard />;
        case 'shipments':
          return <AdminShipmentDashboard />;
        case 'payments':
          return <PaymentManagementDashboard />;
        case 'subscriptions':
          return <FleetSubscriptionManagement />;
        case 'disputes':
          return <DisputeManagement />;
        case 'analytics':
          return <Analytics />;
        case 'ai-insights':
          return <AIInsightsDashboard />;
        case 'anomaly-detection':
          return <AnomalyDetection />;
        case 'demand-forecasting':
          return <DemandForecasting />;
        case 'unified-registration':
          return <UnifiedRegistration />;
        case 'admin-login':
          return <DedicatedLoginPages userType="admin" />;
        default:
          return <AdminDashboard />;
      }
    }

    // Shipper content
    if (userRole === 'shipper') {
      switch (activeTab) {
        case 'dashboard':
          return <ShipperDashboard />;
        case 'create-shipment':
          return <CreateShipment />;
        case 'my-shipments':
          return <ShipperDashboard />;
        case 'tracking':
          return <ShipperDashboard />;
        case 'billing':
          return <ShipperDashboard />;
        case 'analytics':
          return <ShipperDashboard />;
        default:
          return <ShipperDashboard />;
      }
    }

    // Fleet Operator content
    if (userRole === 'fleet') {
      switch (activeTab) {
        case 'dashboard':
          return <FleetOperatorDashboard />;
        case 'fleet-management':
          return <OperatorManagement />;
        case 'subscriptions':
          return <FleetOperatorDashboard />;
        case 'earnings':
          return <FleetOperatorDashboard />;
        case 'requests':
          return <FleetOperatorDashboard />;
        case 'fleet-tracker':
          return <FleetOperatorDashboard />;
        case 'maintenance':
          return <FleetOperatorDashboard />;
        default:
          return <FleetOperatorDashboard />;
      }
    }

    // Individual Operator content
    if (userRole === 'individual') {
      switch (activeTab) {
        case 'dashboard':
          return <IndividualVehicleOwnerDashboard />;
        case 'driver-app':
          return <DriverApp />;
        case 'available-jobs':
          return <AvailableJobs />;
        case 'earnings':
          return <IndividualVehicleOwnerDashboard />;
        case 'performance':
          return <IndividualVehicleOwnerDashboard />;
        case 'feedback':
          return <FeedbackAndRatings />;
        case 'jobs':
          return <IndividualVehicleOwnerDashboard />;
        case 'trips':
          return <IndividualVehicleOwnerDashboard />;
        case 'documents':
          return <IndividualVehicleOwnerDashboard />;
        case 'profile':
          return <IndividualVehicleOwnerDashboard />;
        default:
          return <IndividualVehicleOwnerDashboard />;
      }
    }

    // Regular user content
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={userRole as 'operator' | 'customer' | 'logistics'} onTabChange={handleTabChange} />;
      case 'create-shipment':
        return <CreateShipment />;
      case 'shipment-approval':
        return <ShipmentApproval userRole={userRole as 'logistics'} />;
      case 'operators':
        return <OperatorManagement />;
      case 'tracking':
        return <LiveTracking />;
      case 'my-shipments':
        return <CustomerShipments />;
      case 'available-jobs':
        return <AvailableJobs />;
      case 'active-shipments':
        return <LiveTracking />;
      case 'live-map':
        return <LiveTrackingMap shipmentId="TAS-2024-001" />;
      case 'route-optimizer':
        return (
          <AIRouteOptimizer
            pickup={{ lat: 28.6139, lng: 77.2090, address: 'Delhi, India' }}
            destination={{ lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' }}
            vehicleType="truck"
            urgency="standard"
            onRouteSelect={(route) => console.log('Selected route:', route)}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'ai-insights':
        return <AIInsightsDashboard />;
      case 'predictive-eta':
        return (
          <PredictiveETA
            shipmentId="TAS-2024-001"
            currentLocation={{ lat: 28.6139, lng: 77.2090, address: 'Delhi, India' }}
            destination={{ lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' }}
          />
        );
      case 'demand-forecasting':
        return <DemandForecasting />;
      case 'invoices':
        return <InvoiceManagement userRole={userRole as 'operator' | 'customer' | 'logistics'} />;
      case 'customer-tracking':
        return <CustomerTrackingPortal />;
      case 'company-registration':
        return <CompanyRegistration />;
      case 'vehicle-registration':
        return <VehicleRegistration />;
      case 'verification':
        return <VerificationDashboard />;
      default:
        return <Dashboard userRole={userRole as 'operator' | 'customer' | 'logistics'} onTabChange={handleTabChange} />;
    }
  };

  // Check if we're on customer tracking page (no auth required)
  const isCustomerTrackingPage = window.location.pathname === '/track' || 
                                 window.location.pathname === '/tracking' ||
                                 window.location.search.includes('tracking_token');

  if (isCustomerTrackingPage) {
    return <CustomerTrackingPortal />;
  }

  // Show marketing login page if not authenticated
  if (!authState.isAuthenticated || !userRole) {
    return (
      <MarketingLoginPage 
        onLogin={handleLogin}
        onSignUp={() => {
          // Handle sign up - could redirect to registration or show signup modal
          console.log('Sign up clicked');
        }}
        isLoading={authState.isLoading}
        error={undefined}
      />
    );
  }

  return (
    <DatabaseProvider userId={authState.user?.id} userType="company">
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Header 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            userRole={userRole as 'admin' | 'operator' | 'customer' | 'logistics'}
          />
          
          <div className="flex">
            <Sidebar 
              isOpen={sidebarOpen}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              userRole={userRole as 'admin' | 'shipper' | 'fleet' | 'individual'}
            />
            
            <main className="flex-1 lg:ml-64">
              {renderContent()}
            </main>
          </div>
          
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* AI Assistant */}
          <AIAssistant 
            userType={userRole as 'admin' | 'shipper' | 'fleet' | 'individual' | 'customer' | 'guest'} 
            userId={authState.user?.id}
          />
        </div>
      </AppProvider>
    </DatabaseProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;