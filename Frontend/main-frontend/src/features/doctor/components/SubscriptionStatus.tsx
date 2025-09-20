import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { AlertTriangle, Calendar, CheckCircle, Crown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface SubscriptionInfo {
  status: 'active' | 'expired' | 'none';
  expiryDate?: string;
  planName?: string;
}

const SubscriptionStatus: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor) {
      // Determine subscription status based on subscriptionExpiry
      const expiryDate = doctor.subscriptionExpiry;
      let status: 'active' | 'expired' | 'none' = 'none';
      
      if (expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        status = expiry > now ? 'active' : 'expired';
      }
      
      setSubscriptionInfo({
        status: status,
        expiryDate: expiryDate,
        planName: status === 'active' ? 'Premium Plan' : undefined
      });
      setLoading(false);
    }
  }, [doctor]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionInfo) {
    return null;
  }

  const getStatusColor = () => {
    switch (subscriptionInfo.status) {
      case 'active':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getStatusIcon = () => {
    switch (subscriptionInfo.status) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Crown className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (subscriptionInfo.status) {
      case 'active':
        return 'Active Subscription';
      case 'expired':
        return 'Subscription Expired';
      default:
        return 'Free Plan';
    }
  };

  const formatExpiryDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-semibold">{getStatusText()}</span>
        </div>
        {subscriptionInfo.status !== 'active' && (
          <Link
            to="/doctor/pricing"
            className="text-sm font-medium underline hover:no-underline"
          >
            Upgrade
          </Link>
        )}
      </div>
      
      {subscriptionInfo.status === 'active' && subscriptionInfo.expiryDate && (
        <div className="flex items-center space-x-1 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Expires {formatExpiryDate(subscriptionInfo.expiryDate)}</span>
        </div>
      )}
      
      {subscriptionInfo.status === 'expired' && (
        <p className="text-sm">
          Your subscription has expired. Renew to continue with full features.
        </p>
      )}
      
      {subscriptionInfo.status === 'none' && (
        <p className="text-sm">
          You're on the free plan. Upgrade for unlimited patients and advanced features.
        </p>
      )}
    </div>
  );
};

export default SubscriptionStatus;
