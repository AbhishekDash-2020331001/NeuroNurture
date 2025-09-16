import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import { makeAuthenticatedSchoolRequest } from '@/utils/schoolApiUtils';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Lock, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S6l8D0EZDpckBwTmtFUk2EKtCa85tMHL0Uj4yBzTKclKnttvL0ILZ7NLRewbmlBCRTOBkkEy8IhLa7y4NHBRoZF00dWsOLlkx');

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  currency: string;
  durationInMonths: number;
  features: string[];
}

const CheckoutForm: React.FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { school, updateSchoolData } = useSchoolAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await makeAuthenticatedSchoolRequest('http://localhost:8091/api/school/subscription/create-payment-intent', {
        method: 'POST',
        headers: {
          'X-School-Id': school?.id || '',
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await makeAuthenticatedSchoolRequest('http://localhost:8091/api/school/subscription/confirm-payment', {
          method: 'POST',
          headers: {
            'X-School-Id': school?.id || '',
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        if (confirmResponse.ok) {
          const responseData = await confirmResponse.json();
          console.log('Payment confirmation response:', responseData);
          
          // Update school context with new subscription data
          if (responseData.school) {
            const updatedSchoolData = {
              subscriptionStatus: responseData.school.subscriptionStatus,
              subscriptionPlan: responseData.school.subscriptionPlan || 'free',
              subscriptionExpiry: responseData.school.subscriptionExpiry,
              childrenLimit: responseData.school.childrenLimit,
              currentChildren: responseData.school.currentChildren
            };
            
            // Update the school context with new subscription data
            updateSchoolData(updatedSchoolData);
            console.log('Updated school context with subscription data:', updatedSchoolData);
          }
          
          handlePaymentSuccess(plan.id);
        } else {
          throw new Error('Failed to confirm payment');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (planId: string) => {
    navigate(`/school/payment-success?plan=${planId}`);
  };

  const formatPrice = (priceInCents: number) => {
    // Convert USD to Taka (BDT) by multiplying by 100
    const priceInTaka = (priceInCents / 100) * 100;
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(priceInTaka);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{plan.name}</span>
            <span className="font-semibold">{formatPrice(plan.priceInCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span className="font-semibold">
              {plan.durationInMonths / 12} {plan.durationInMonths / 12 === 1 ? 'year' : 'years'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(plan.priceInCents)}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Complete Payment
          </>
        )}
      </button>
    </form>
  );
};

const SchoolCheckoutPage: React.FC = () => {
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
      navigate('/school/pricing');
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
          setPlan({
            ...selectedPlan,
            features: [
              'Unlimited children enrollment',
              'Full analytics dashboard',
              'Priority support',
              'Advanced reporting',
              'Data export capabilities',
              'Custom task creation',
              'Tournament management',
              'Performance tracking'
            ]
          });
        } else {
          navigate('/school/pricing');
        }
      } else {
        navigate('/school/pricing');
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      navigate('/school/pricing');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <p className="text-gray-600 mb-6">The selected plan could not be found.</p>
          <button
            onClick={() => navigate('/school/pricing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/school/pricing')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Pricing
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div>
            <Elements stripe={stripePromise}>
              <CheckoutForm plan={plan} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">What's included:</h5>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Trust</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Powered by Stripe</span>
                </div>
              </div>
            </div>

            {/* School Info */}
            {school && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">School Information</h3>
                <p className="text-blue-700">
                  <strong>{school.name}</strong><br />
                  {school.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCheckoutPage;
