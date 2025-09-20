import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { ArrowRight, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  durationInMonths: number;
  features: string;
}

const PaymentSuccessPage: React.FC = () => {
  const { doctor, isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/doctor/login');
      return;
    }
    fetchPlanDetails();
  }, [isAuthenticated, navigate]);

  const fetchPlanDetails = async () => {
    try {
      const planId = searchParams.get('plan');
      if (!planId) {
        // If no plan ID in URL, try to get from doctor context or redirect
        navigate('/doctor/dashboard');
        return;
      }

      const response = await fetch('http://localhost:8093/api/doctor/subscription/plans');
      if (response.ok) {
        const plans = await response.json();
        const selectedPlan = plans.find((p: any) => p.id === planId);
        if (selectedPlan) {
          setPlan(selectedPlan);
        }
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    // Convert USD to Taka by multiplying by 100
    const priceInTaka = (priceInCents / 100) * 100;
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(priceInTaka);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getSubscriptionExpiry = () => {
    if (!doctor?.subscriptionExpiry) return null;
    return doctor.subscriptionExpiry;
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
          
          {plan && doctor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Plan</span>
                </div>
                <span className="text-gray-900">{plan.name}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Expires</span>
                </div>
                <span className="text-gray-900">{formatDate(getSubscriptionExpiry())}</span>
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
                  {formatPrice(plan.priceInCents, plan.currency)}
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
