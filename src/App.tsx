import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { ShipperProvider, useShipper } from './context/ShipperContext';
import { FleetOperatorProvider, useFleetOperator } from './context/FleetOperatorContext';
import { IndividualVehicleOwnerProvider, useIndividualVehicleOwner } from './context/IndividualVehicleOwnerContext';
import { CustomerProvider } from './context/CustomerContext';

// Import all components as per our discussion
import MarketingLoginPage from './components/MarketingLoginPage';
import LoginForm from './components/LoginForm';
import AdminLoginPage from './components/AdminLoginPage';
import EnhancedAdminDashboard from './components/EnhancedAdminDashboard';
import ShipperDashboard from './components/ShipperDashboard';
import ShipperRegistration from './components/ShipperRegistration';
import FleetOperatorDashboard from './components/FleetOperatorDashboard';
import FleetOperatorRegistration from './components/FleetOperatorRegistration';
import IndividualVehicleOwnerDashboard from './components/IndividualVehicleOwnerDashboard';
import IndividualVehicleOwnerRegistration from './components/IndividualVehicleOwnerRegistration';
import CustomerTrackingRoute from './components/CustomerTrackingRoute';
import AIAssistant from './components/AIAssistant';

const AppContent: React.FC = () => {
  const { state: authState } = useAuth();
  const { isAdminAuthenticated } = useAdmin();
  const { isShipperAuthenticated } = useShipper();
  const { isFleetOperatorAuthenticated } = useFleetOperator();
  const { isIndividualVehicleOwnerAuthenticated } = useIndividualVehicleOwner();

  const [userRole, setUserRole] = useState<'admin' | 'shipper' | 'fleet' | 'individual' | 'operator' | 'customer' | 'logistics' | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showShipperRegistration, setShowShipperRegistration] = useState(false);
  const [showFleetOperatorRegistration, setShowFleetOperatorRegistration] = useState(false);
  const [showIndividualVehicleOwnerRegistration, setShowIndividualVehicleOwnerRegistration] = useState(false);

  useEffect(() => {
    // Priority order: Admin > Shipper > Fleet Operator > Individual Vehicle Owner > General User
    if (isAdminAuthenticated) {
      setUserRole('admin');
    } else if (isShipperAuthenticated) {
      setUserRole('shipper');
    } else if (isFleetOperatorAuthenticated) {
      setUserRole('fleet');
    } else if (isIndividualVehicleOwnerAuthenticated) {
      setUserRole('individual');
    } else if (authState.isAuthenticated && authState.user) {
      setUserRole(authState.user.role as 'operator' | 'customer' | 'logistics');
    }
  }, [authState, isAdminAuthenticated, isShipperAuthenticated, isFleetOperatorAuthenticated, isIndividualVehicleOwnerAuthenticated]);

  const handleLogin = (role: 'admin' | 'shipper' | 'fleet' | 'individual' | 'operator' | 'customer' | 'logistics') => {
    if (role === 'admin') {
      setShowAdminLogin(true);
    } else if (role === 'shipper') {
      setShowShipperRegistration(true);
    } else if (role === 'fleet') {
      setShowFleetOperatorRegistration(true);
    } else if (role === 'individual') {
      setShowIndividualVehicleOwnerRegistration(true);
    } else {
      setUserRole(role);
      setActiveTab('dashboard');
    }
  };

  const handleAdminLogin = () => {
    setShowAdminLogin(false);
    setUserRole('admin');
    setActiveTab('dashboard');
  };

  const handleShipperRegistration = () => {
    setShowShipperRegistration(false);
    setUserRole('shipper');
    setActiveTab('dashboard');
  };

  const handleFleetOperatorRegistration = () => {
    setShowFleetOperatorRegistration(false);
    setUserRole('fleet');
    setActiveTab('dashboard');
  };

  const handleIndividualVehicleOwnerRegistration = () => {
    setShowIndividualVehicleOwnerRegistration(false);
    setUserRole('individual');
    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    // Check for customer tracking pages
    const path = window.location.pathname;
    if (path.startsWith('/track') || path.startsWith('/tracking')) {
      return <CustomerTrackingRoute />;
    }

    // Admin Dashboard - Complete 9-module system as discussed
    if (userRole === 'admin') {
      return <EnhancedAdminDashboard />;
    }

    // Shipper Dashboard - Complete shipper portal as discussed
    if (userRole === 'shipper') {
      return <ShipperDashboard />;
    }

    // Fleet Operator Dashboard - Complete fleet management as discussed
    if (userRole === 'fleet') {
      return <FleetOperatorDashboard />;
    }

    // Individual Vehicle Owner Dashboard - Mobile-first as discussed
    if (userRole === 'individual') {
      return <IndividualVehicleOwnerDashboard />;
    }

    // Default landing page
    return (
      <MarketingLoginPage 
        onLogin={handleLogin} 
        onSignUp={() => {}} 
        isLoading={false} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show login/registration forms as per our discussion */}
      {showAdminLogin && (
        <AdminLoginPage onLogin={handleAdminLogin} />
      )}
      
      {showShipperRegistration && (
        <ShipperRegistration onRegistration={handleShipperRegistration} />
      )}
      
      {showFleetOperatorRegistration && (
        <FleetOperatorRegistration onRegistration={handleFleetOperatorRegistration} />
      )}
      
      {showIndividualVehicleOwnerRegistration && (
        <IndividualVehicleOwnerRegistration onRegistration={handleIndividualVehicleOwnerRegistration} />
      )}

      {/* Main content */}
      {renderContent()}

      {/* AI Assistant - Available for all roles as discussed */}
      <AIAssistant 
        userType={userRole || 'guest'} 
        userId={authState.user?.id || ''} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DatabaseProvider userType="company" userId="">
        <AdminProvider>
          <ShipperProvider>
            <FleetOperatorProvider>
              <IndividualVehicleOwnerProvider>
                <CustomerProvider>
                  <AppContent />
                </CustomerProvider>
              </IndividualVehicleOwnerProvider>
            </FleetOperatorProvider>
          </ShipperProvider>
        </AdminProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
};

export default App;