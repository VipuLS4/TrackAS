import React from 'react';
import { AuthProvider } from './context/AuthContext';
import MarketingLoginPage from './components/MarketingLoginPage';

const App: React.FC = () => {
  const handleLogin = (role: string) => {
    console.log('Login attempted for role:', role);
    // For now, just show a simple message
    alert(`Login attempted for ${role} role. This is a demo version.`);
  };

  const handleSignUp = () => {
    console.log('Sign up attempted');
    alert('Sign up functionality coming soon!');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <MarketingLoginPage 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
          isLoading={false} 
        />
      </div>
    </AuthProvider>
  );
};

export default App;