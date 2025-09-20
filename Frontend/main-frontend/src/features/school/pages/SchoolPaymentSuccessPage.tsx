import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { makeAuthenticatedSchoolRequest } from '@/shared/utils/schoolApiUtils';
import { ArrowRight, Calendar, CheckCircle, CreditCard, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  durationInMonths: number;
}

const SchoolPaymentSuccessPage: React.FC = () => {
  const { school, isAuthenticated } = useSchoolAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const planId = searchParams.get('plan');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/school/login');
      return;
    }

    if (!planId) {
      navigate('/school/dashboard');
      return;
    }

    fetchPlan();
  }, [isAuthenticated, navigate, planId]);

  const fetchPlan = async () => {
    try {
      const response = await makeAuthenticatedSchoolRequest('http://localhost:8091/api/school/subscription/plans');
      if (response.ok) {
        const plans = await response.json();
        const selectedPlan = plans.find((p: any) => p.id === planId);
        
        if (selectedPlan) {
          setPlan(selectedPlan);
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    // Convert USD to Taka (BDT) by multiplying by 100
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

  // Calculate expiry date based on plan duration
  const calculateExpiryDate = () => {
    if (!plan) return 'N/A';
    
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (plan.durationInMonths * 30 * 24 * 60 * 60 * 1000));
    
    return expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your subscription has been activated successfully. Welcome to NeuroNurture Premium!
          </p>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-semibold text-gray-900">
                    {plan?.name || 'Current Plan'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-semibold text-gray-900">
                    {calculateExpiryDate()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-semibold text-gray-900">
                    {plan ? formatPrice(plan.priceInCents) : '$0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Dashboard</h3>
              <p className="text-gray-600 text-sm">
                Access your enhanced dashboard with premium features and analytics.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enroll Children</h3>
              <p className="text-gray-600 text-sm">
                Add unlimited children to your school and start tracking their progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Tasks</h3>
              <p className="text-gray-600 text-sm">
                Design custom learning tasks and tournaments for your students.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Premium Features Unlocked</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Unlimited Children</h3>
                  <p className="text-gray-600 text-sm">Enroll unlimited students without restrictions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                  <p className="text-gray-600 text-sm">Detailed performance tracking and insights</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Custom Tasks</h3>
                  <p className="text-gray-600 text-sm">Create personalized learning activities</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Tournament Management</h3>
                  <p className="text-gray-600 text-sm">Organize competitive learning events</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Priority Support</h3>
                  <p className="text-gray-600 text-sm">Get help when you need it most</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Data Export</h3>
                  <p className="text-gray-600 text-sm">Export reports and student data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/school/dashboard')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          <button
            onClick={() => navigate('/school/children')}
            className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          >
            Manage Children
            <Users className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@neuronurture.com" className="text-blue-600 hover:underline">
              support@neuronurture.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolPaymentSuccessPage;
