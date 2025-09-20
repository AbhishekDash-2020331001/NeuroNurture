import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
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

const DoctorPricingPage: React.FC = () => {
  const { doctor, isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/doctor/login');
      return;
    }
    fetchPlans();
  }, [isAuthenticated, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:8093/api/doctor/subscription/plans');
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
              'Unlimited patients',
              'Full analytics dashboard',
              'Priority support',
              'Advanced reporting',
              'Data export capabilities'
            ],
            popular: plan.id === '1_year',
            savings: plan.id === '3_year' ? 'Save 16%' : undefined
          };
        });
        console.log('Transformed plans:', transformedPlans);
        setPlans(transformedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    console.log('formatPrice called with:', { priceInCents, currency });
    if (!priceInCents || isNaN(priceInCents)) {
      console.error('Invalid priceInCents:', priceInCents);
      return '৳0.00';
    }
    // Convert USD to Taka by multiplying by 100
    const priceInTaka = (priceInCents / 100) * 100;
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(priceInTaka);
  };

  const handleSelectPlan = (planId: string) => {
    navigate(`/doctor/subscription/checkout?plan=${planId}`);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock unlimited patients, advanced analytics, and priority support with our flexible subscription plans.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(plan.priceInCents, plan.currency)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    /{plan.durationInMonths === 12 ? 'year' : `${plan.durationInMonths / 12} years`}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {formatPrice(plan.priceInCents / (plan.durationInMonths / 12), plan.currency)} per year
                </p>
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-1">
                  Debug: priceInCents={plan.priceInCents}, durationInMonths={plan.durationInMonths}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.popular ? (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Get Started
                  </span>
                ) : (
                  'Choose Plan'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What's Included in All Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Unlimited Patients</h4>
              <p className="text-gray-600 text-sm">
                Add and manage unlimited patients without any restrictions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
              <p className="text-gray-600 text-sm">
                Get detailed insights and reports on patient progress and outcomes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
              <p className="text-gray-600 text-sm">
                Get priority support and faster response times for all your needs.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change my plan later?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and bank transfers through Stripe.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                Yes, you can use the platform with limited features for free. Upgrade anytime for full access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPricingPage;
