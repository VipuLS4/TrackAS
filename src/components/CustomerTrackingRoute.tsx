ok
import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerTrackingPortal from './CustomerTrackingPortal';

interface CustomerTrackingRouteProps {
  token?: string;
}

const CustomerTrackingRoute: React.FC<CustomerTrackingRouteProps> = ({ token }) => {
  const { token: urlToken } = useParams<{ token: string }>();
  
  // Use token from props or URL params
  const trackingToken = token || urlToken;

  if (!trackingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Tracking Link</h1>
          <p className="text-gray-600">Please check your tracking link and try again.</p>
        </div>
      </div>
    );
  }

  return <CustomerTrackingPortal token={trackingToken} />;
};

export default CustomerTrackingRoute;
