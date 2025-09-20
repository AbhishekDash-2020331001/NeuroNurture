import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Crown,
    Download,
    MessageSquare,
    Shield,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface SubscriptionInfo {
  id: string;
  status: string;
  expiresAt: string;
  planName: string;
  amountInCents: number;
  currency: string;
}

const DoctorSubscriptionPage: React.FC = () => {
  const { doctor, isAuthenticated } = useDoctorAuth();
  const navigate = useNavigate();
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

  const isSubscriptionActive = () => {
    if (!doctor?.subscriptionExpiry) return false;
    return new Date(doctor.subscriptionExpiry) > new Date();
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    // Convert USD to Taka by multiplying by 100
    const priceInTaka = (priceInCents / 100) * 100;
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(priceInTaka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = () => {
    if (!doctor?.subscriptionExpiry) return null;
    const now = new Date();
    const expiry = new Date(doctor.subscriptionExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const premiumFeatures = [
    {
      icon: Users,
      title: 'Unlimited Patients',
      description: 'Add and manage unlimited patients without any restrictions',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get detailed insights and reports on patient progress and outcomes',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: MessageSquare,
      title: 'Priority Support',
      description: 'Get priority support and faster response times for all your needs',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Download,
      title: 'Data Export',
      description: 'Export patient data and reports in multiple formats',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Advanced security features and data protection',
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Zap,
      title: 'Advanced Tools',
      description: 'Access to premium assessment tools and features',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription and access premium features</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isSubscriptionActive()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <Crown className="w-4 h-4 mr-1" />
                  {isSubscriptionActive() ? 'Premium Active' : 'Free Plan'}
                </div>
              </div>

              {isSubscriptionActive() ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">Expires</span>
                    </div>
                    <span className="text-gray-900">{formatDate(doctor?.subscriptionExpiry || '')}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Days Remaining</span>
                    </div>
                    <span className="text-gray-900">{getDaysUntilExpiry()} days</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">Patient Limit</span>
                    </div>
                    <span className="text-gray-900">Unlimited</span>
                  </div>

                  {getDaysUntilExpiry() && getDaysUntilExpiry()! <= 30 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800">Subscription Expiring Soon</h3>
                          <p className="text-sm text-yellow-700">
                            Your subscription expires in {getDaysUntilExpiry()} days. Renew to continue enjoying premium features.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">You're on the Free Plan</h3>
                  <p className="text-gray-600 mb-4">
                    Limited to {doctor?.maxChildren || 3} patients. Upgrade to unlock unlimited patients and premium features.
                  </p>
                  <Link
                    to="/doctor/pricing"
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Upgrade Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Premium Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className={`${feature.bgColor} rounded-lg p-4`}>
                    <div className="flex items-start">
                      <feature.icon className={`h-6 w-6 ${feature.color} mr-3 mt-1`} />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {!isSubscriptionActive() && (
                  <Link
                    to="/doctor/pricing"
                    className="flex items-center justify-between w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <span className="font-medium">Upgrade to Premium</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                
                <Link
                  to="/doctor/pricing"
                  className="flex items-center justify-between w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="font-medium">View Plans</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/doctor/tickets"
                  className="flex items-center justify-between w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="font-medium">Contact Support</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Current Usage */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Patients</span>
                    <span className="text-sm text-gray-500">
                      {doctor?.currentChildrenCount || 0} / {isSubscriptionActive() ? '∞' : (doctor?.maxChildren || 3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isSubscriptionActive() 
                          ? 'bg-green-500' 
                          : (doctor?.currentChildrenCount || 0) >= (doctor?.maxChildren || 3)
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}
                      style={{
                        width: isSubscriptionActive() 
                          ? '100%' 
                          : `${Math.min(((doctor?.currentChildrenCount || 0) / (doctor?.maxChildren || 3)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Plan Status</span>
                    <span className={`text-sm font-medium ${
                      isSubscriptionActive() ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isSubscriptionActive() ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

             {/* Benefits Summary - Only show if not premium */}
             {!isSubscriptionActive() && (
               <div className="bg-gradient-to-br from-black via-red-600 to-red-700 rounded-lg shadow-lg p-6 text-white">
                 <div className="flex items-center mb-4">
                   <Crown className="h-6 w-6 mr-2 text-yellow-400" />
                   <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
                 </div>
                 <p className="text-sm text-gray-200 mb-4">
                   Unlock unlimited patients and premium features to enhance your practice.
                 </p>
                 <ul className="space-y-3 text-sm">
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Unlimited patients</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Advanced analytics & reports</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Priority support</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Data export tools</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Enhanced security</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-4 w-4 mr-3 text-green-400" />
                     <span>Advanced assessment tools</span>
                   </li>
                 </ul>
                 <div className="mt-6">
                   <Link
                     to="/doctor/pricing"
                     className="inline-flex items-center justify-center w-full px-4 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                   >
                     <Crown className="mr-2 h-5 w-5" />
                     View Premium Plans
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                 </div>
               </div>
             )}

             {/* Premium Status Card - Only show if premium is active */}
             {isSubscriptionActive() && (
               <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                 <div className="flex items-center mb-4">
                   <Crown className="h-6 w-6 mr-2 text-yellow-400" />
                   <h3 className="text-lg font-semibold">Premium Active</h3>
                 </div>
                 <p className="text-sm text-green-100 mb-4">
                   You're enjoying all premium features and unlimited patient access.
                 </p>
                 <div className="space-y-2 text-sm">
                   <div className="flex items-center justify-between">
                     <span>Status:</span>
                     <span className="font-semibold">Active</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Expires:</span>
                     <span className="font-semibold">{formatDate(doctor?.subscriptionExpiry || '')}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Patients:</span>
                     <span className="font-semibold">Unlimited</span>
                   </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-green-400">
                   <p className="text-xs text-green-100">
                     Thank you for being a premium member!
                   </p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSubscriptionPage;
