import { useDoctorAuth } from '@/contexts/doctor/DoctorAuthContext';
import { ArrowRight, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SubscriptionInfo {
  id: string;
  status: string;
  expiresAt: string;
  planName: string;
  amountInCents: number;
  currency: string;
}

const PaymentSuccessPage: React.FC = () => {
  const { doctor, isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/doctor/login');
      return;
    }
    fetchSubscriptionInfo();
  }, [isAuthenticated, navigate]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('http://localhost:8093/api/doctor/subscription/current', {
        headers: {
          'X-Doctor-Id': doctor?.id,
          'Authorization': `Bearer ${localStorage.getItem('doctorToken')}`
        }
      });

      if (response.ok) {
        const subscriptionData = await response.json();
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    const price = priceInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your subscription has been activated successfully.
          </p>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Details</h2>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Plan</span>
                </div>
                <span className="text-gray-900">{subscription.planName}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Expires</span>
                </div>
                <span className="text-gray-900">{formatDate(subscription.expiresAt)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="font-medium text-gray-900">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="font-medium text-gray-900">Amount Paid</span>
                <span className="text-gray-900">
                  {formatPrice(subscription.amountInCents, subscription.currency)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading subscription details...</p>
            </div>
          )}
        </div>

        {/* Benefits Card */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Access to unlimited patients
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Full analytics dashboard
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Priority support
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
              Advanced reporting tools
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/doctor/pricing')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Manage Subscription
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can manage your subscription and view billing history from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
