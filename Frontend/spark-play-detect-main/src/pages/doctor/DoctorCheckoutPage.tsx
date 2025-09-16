import { useDoctorAuth } from '@/contexts/doctor/DoctorAuthContext';
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Check, CreditCard, Shield } from 'lucide-react';
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

// Payment Form Component using Stripe Elements
interface PaymentFormProps {
  plan: SubscriptionPlan;
  doctor: any;
  onPaymentSuccess: () => void;
  onError: (error: string) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  doctor,
  onPaymentSuccess,
  onError,
  processing,
  setProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { updateDoctor } = useDoctorAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    onError(null);

    try {
      // Step 1: Create Payment Intent
      console.log('Creating payment intent for plan:', plan.id);
      
      const createResponse = await fetch('http://localhost:8093/api/doctor/subscription/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Doctor-Id': doctor.id,
          'Authorization': `Bearer ${localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          planId: plan.id
        })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Error creating payment intent:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          onError(errorData.error || 'Failed to create payment intent');
        } catch (e) {
          onError(`Failed to create payment intent: ${createResponse.status}`);
        }
        return;
      }

      const paymentIntent = await createResponse.json();
      console.log('Payment intent created:', paymentIntent);

      // Validate payment intent response
      if (!paymentIntent.clientSecret) {
        onError('Failed to create payment intent - no client secret returned');
        return;
      }

      // Step 2: Confirm Payment with Stripe Elements
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError('Card element not found');
        return;
      }

      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: doctor.firstName + ' ' + doctor.lastName,
              email: doctor.email,
            },
          }
        }
      );

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed');
        return;
      }

      if (confirmedPaymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', confirmedPaymentIntent.id);
        
        // Step 3: Confirm payment on backend
        const confirmResponse = await fetch('http://localhost:8093/api/doctor/subscription/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Doctor-Id': doctor.id,
            'Authorization': `Bearer ${localStorage.getItem('doctorToken')}`
          },
          body: JSON.stringify({
            paymentIntentId: confirmedPaymentIntent.id
          })
        });

        if (confirmResponse.ok) {
          const confirmData = await confirmResponse.json();
          console.log('Payment confirmed successfully:', confirmData);
          
          // Update doctor data if returned
          if (confirmData.doctor) {
            updateDoctor(confirmData.doctor);
          }
          
          onPaymentSuccess();
        } else {
          const errorText = await confirmResponse.text();
          console.error('Error confirming payment:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            onError(errorData.error || 'Payment confirmation failed');
          } catch (e) {
            onError(`Payment confirmation failed: ${confirmResponse.status}`);
          }
        }
      } else {
        onError('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-700">Card Information</span>
        </div>
        <CardElement options={cardElementOptions} />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: plan.currency.toUpperCase()
          }).format(plan.priceInCents / 100)}`
        )}
      </button>
    </form>
  );
};

const DoctorCheckoutPage: React.FC = () => {
  const { doctor, isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/doctor/login');
      return;
    }
    if (!planId) {
      navigate('/doctor/pricing');
      return;
    }
    fetchPlan();
  }, [isAuthenticated, navigate, planId]);

  const fetchPlan = async () => {
    try {
      const response = await fetch('http://localhost:8093/api/doctor/subscription/plans');
      if (response.ok) {
        const plans = await response.json();
        const selectedPlan = plans.find((p: any) => p.id === planId);
        if (selectedPlan) {
          setPlan({
            ...selectedPlan,
            features: selectedPlan.features.split(', ')
          });
        } else {
          navigate('/doctor/pricing');
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load plan details');
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

  const handlePaymentSuccess = () => {
    navigate(`/doctor/payment-success?plan=${planId}`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <button
            onClick={() => navigate('/doctor/pricing')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/doctor/pricing')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to pricing
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Subscription</h1>
          <p className="text-gray-600 mt-2">Secure payment powered by Stripe</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatPrice(plan.priceInCents, plan.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    /{plan.durationInMonths === 12 ? 'year' : `${plan.durationInMonths} years`}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-900">What's included:</h4>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(plan.priceInCents, plan.currency)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Billed {plan.durationInMonths === 12 ? 'annually' : 'every 3 years'}
              </p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Stripe Elements Payment Form */}
            <Elements stripe={stripePromise}>
              <PaymentForm
                plan={plan}
                doctor={doctor}
                onPaymentSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                processing={processing}
                setProcessing={setProcessing}
              />
            </Elements>

            <div className="flex items-center text-sm text-gray-600 mt-6">
              <Shield className="w-4 h-4 mr-2" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              You can cancel anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCheckoutPage;
