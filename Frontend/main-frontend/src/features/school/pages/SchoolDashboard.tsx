import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import { childrenService } from '@/shared/services/child/childrenService';
import {
    Activity,
    Award,
    BarChart3,
    BookOpen,
    Calendar,
    TrendingUp,
    Trophy,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SchoolAssistant from './SchoolAssistant';

const SchoolDashboard: React.FC = () => {
  const { school } = useSchoolAuth();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [actualChildrenCount, setActualChildrenCount] = useState<number>(0);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  // SchoolAuthGuard handles authentication, so we can assume school exists here

  // Fetch actual children count
  useEffect(() => {
    const fetchChildrenCount = async () => {
      if (school?.id) {
        console.log('School data:', school);
        console.log('School currentChildren from context:', school.currentChildren);
        try {
          setIsLoadingChildren(true);
          const children = await childrenService.getChildrenBySchool(parseInt(school.id));
          setActualChildrenCount(children.length);
          console.log('Fetched children count:', children.length);
        } catch (error) {
          console.error('Error fetching children count:', error);
          // Fallback to the value from school context
          setActualChildrenCount(school.currentChildren || 0);
        } finally {
          setIsLoadingChildren(false);
        }
      }
    };

    fetchChildrenCount();
  }, [school?.id, school?.currentChildren]);

  const stats = [
    {
      name: 'Total Children',
      value: isLoadingChildren ? '...' : actualChildrenCount,
      icon: Users,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      href: '/school/children'
    },
    {
      name: 'Active Tasks',
      value: '12',
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      href: '/school/tasks'
    },
    {
      name: 'Ongoing Tournaments',
      value: '3',
      icon: Trophy,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      href: '/school/tournaments'
    },
    {
      name: 'Avg. Performance',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      href: '/school/progress-comparison'
    }
  ];

  const quickActions = [
    {
      name: 'Add New Task',
      description: 'Create assignments for students',
      icon: BookOpen,
      href: '/school/tasks',
      color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
    },
    {
      name: 'Create Tournament',
      description: 'Set up competitive events',
      icon: Trophy,
      href: '/school/tournaments',
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
    },
    {
      name: 'View Progress',
      description: 'Analyze student performance',
      icon: BarChart3,
      href: '/school/progress-comparison',
      color: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
    },
    {
      name: 'Manage Children',
      description: 'View and update child info',
      icon: Users,
      href: '/school/children',
      color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
    }
  ];

  // Check if school has active subscription
  const isSubscriptionActive = () => {
    console.log('SchoolDashboard: Checking subscription status');
    console.log('SchoolDashboard: School data:', school);
    console.log('SchoolDashboard: Subscription expiry (raw):', school?.subscriptionExpiry);
    console.log('SchoolDashboard: Subscription plan:', school?.subscriptionPlan);
    console.log('SchoolDashboard: Subscription status:', school?.subscriptionStatus);
    
    if (!school?.subscriptionExpiry) {
      console.log('SchoolDashboard: No subscription expiry date, returning false');
      return false;
    }
    
    const now = new Date();
    console.log('SchoolDashboard: Current date:', now);
    console.log('SchoolDashboard: Current date ISO:', now.toISOString());
    
    const expiryDate = new Date(school.subscriptionExpiry);
    console.log('SchoolDashboard: Parsed expiry date:', expiryDate);
    console.log('SchoolDashboard: Expiry date ISO:', expiryDate.toISOString());
    console.log('SchoolDashboard: Is valid date:', !isNaN(expiryDate.getTime()));
    
    const isActive = expiryDate > now;
    console.log('SchoolDashboard: Is active:', isActive);
    console.log('SchoolDashboard: Time difference (ms):', expiryDate.getTime() - now.getTime());
    
    return isActive;
  };

  return (
    <div className="space-y-6">
      {/* Assistant */}
      <SchoolAssistant 
        isOpen={isAssistantOpen} 
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)} 
      />


      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {school.name}!</h1>
            <p className="text-gray-600 text-lg mb-4">
              Here's what's happening with your children today.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                {isLoadingChildren ? '...' : actualChildrenCount} active children
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className={`p-4 rounded-xl ${stat.color} text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className={`text-xs font-medium ${stat.textColor} flex items-center`}>
                <div className={`w-2 h-2 rounded-full ${stat.color} mr-2`}></div>
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-green-500 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`p-6 rounded-xl border-2 border-solid hover:shadow-lg transition-all duration-200 group ${action.color}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-white shadow-md group-hover:scale-110 transition-transform duration-200 mb-4">
                  <action.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">{action.name}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upgrade Section for Free Users */}
      {!isSubscriptionActive() && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unlock Premium Features</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upgrade to Premium to access unlimited children enrollment, advanced analytics, 
              custom task creation, and priority support.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Unlimited Children</h3>
                <p className="text-sm text-gray-600">Enroll unlimited students</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-600">Detailed performance insights</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Custom Tasks</h3>
                <p className="text-sm text-gray-600">Create personalized activities</p>
              </div>
            </div>
            
            <Link
              to="/school/pricing"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              View Premium Plans
              <Award className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Status</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-gray-500 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                isSubscriptionActive() ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Plan</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {isSubscriptionActive() ? 'Premium Plan' : 'Free Plan'}
            </p>
            <p className="text-gray-600 mb-2">
              {school.currentChildren} of {school.childrenLimit} children enrolled
            </p>
            {isSubscriptionActive() && school.subscriptionExpiry && (
              <p className="text-sm text-gray-500">
                Expires: {new Date(school.subscriptionExpiry).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isSubscriptionActive() 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {isSubscriptionActive() ? 'Premium' : 'Free'}
            </div>
            {isSubscriptionActive() && (
              <p className="text-xs text-green-600 mt-2 font-medium">All features available</p>
            )}
            {!isSubscriptionActive() && (
              <p className="text-xs text-gray-500 mt-2">Limited features</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
