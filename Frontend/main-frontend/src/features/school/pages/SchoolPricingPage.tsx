import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { makeAuthenticatedSchoolRequest } from '@/shared/utils/schoolApiUtils';
import { Check, Star, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  durationInMonths: number;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const SchoolPricingPage: React.FC = () => {
  const { school, isAuthenticated } = useSchoolAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/school/login');
      return;
    }
    fetchPlans();
  }, [isAuthenticated, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await makeAuthenticatedSchoolRequest('http://localhost:8091/api/school/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        console.log('Raw plans data from backend:', data);
        
        // Transform backend data to frontend format
        const transformedPlans = data.map((plan: any) => {
          console.log('Processing plan:', plan);
          return {
            ...plan,
            // Backend already sends priceInCents, so we don't need to convert
            features: [
              'Unlimited children enrollment',
              'Full analytics dashboard',
              'Priority support',
              'Advanced reporting',
              'Data export capabilities',
              'Custom task creation',
              'Tournament management',
              'Performance tracking'
            ],
            popular: plan.id === '1_year', // Mark annual plan as popular
            savings: plan.id === '3_year' ? 'Save 17%' : undefined
          };
        });
        
        console.log('Transformed plans:', transformedPlans);
        setPlans(transformedPlans);
      } else {
        console.error('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
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

  const handleSelectPlan = (planId: string) => {
    navigate(`/school/checkout?plan=${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your School Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of NeuroNurture for your school with our comprehensive plans.
            Manage unlimited children, track performance, and create engaging learning experiences.
          </p>
        </div>

        {/* Current Plan Status */}
        {school && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Current Status</h3>
                <p className="text-blue-700">
                  Plan: <span className="font-medium">{school.subscriptionPlan || 'Free'}</span>
                  {school.subscriptionExpiry && (
                    <span className="ml-4">
                      Expires: {new Date(school.subscriptionExpiry).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              {school.subscriptionPlan === 'free' && (
                <div className="text-sm text-blue-600">
                  Upgrade to unlock premium features
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-blue-500 transform scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {formatPrice(plan.priceInCents)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      / {plan.durationInMonths / 12} {plan.durationInMonths / 12 === 1 ? 'year' : 'years'}
                    </span>
                  </div>

                  {plan.savings && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Zap className="h-4 w-4 mr-1" />
                      {plan.savings}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {school?.subscriptionPlan === 'premium' ? 'Manage Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose NeuroNurture?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track student progress with detailed analytics and performance insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlimited Children</h3>
              <p className="text-gray-600">
                Enroll unlimited students without restrictions or additional fees.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Priority Support</h3>
              <p className="text-gray-600">
                Get dedicated support and faster response times for your school.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data is safe and will be retained for 30 days after cancellation. You can reactivate your account anytime during this period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all new subscriptions. Contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolPricingPage;
