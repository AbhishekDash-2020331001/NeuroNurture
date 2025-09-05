import React from 'react';
import { Link } from 'react-router-dom';
import { useSchoolAuth } from '@/contexts/school/SchoolAuthContext';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react';

const SchoolDashboard: React.FC = () => {
  const { school } = useSchoolAuth();

  // SchoolAuthGuard handles authentication, so we can assume school exists here

  const stats = [
    {
      name: 'Total Children',
      value: school.currentChildren,
      icon: Users,
      color: 'bg-blue-500',
      href: '/school/children'
    },
    {
      name: 'Active Tasks',
      value: '12',
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/school/tasks'
    },
    {
      name: 'Ongoing Tournaments',
      value: '3',
      icon: Trophy,
      color: 'bg-yellow-500',
      href: '/school/tournaments'
    },
    {
      name: 'Avg. Performance',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/school/progress-comparison'
    }
  ];

  const quickActions = [
    {
      name: 'Add New Task',
      description: 'Create assignments for students',
      icon: BookOpen,
      href: '/school/tasks',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      name: 'Create Tournament',
      description: 'Set up competitive events',
      icon: Trophy,
      href: '/school/tournaments',
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    },
    {
      name: 'View Progress',
      description: 'Analyze student performance',
      icon: BarChart3,
      href: '/school/progress-comparison',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      name: 'Manage Children',
      description: 'View and update child info',
      icon: Users,
      href: '/school/children',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  ];


  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {school.name}!</h1>
        <p className="text-blue-100 text-lg">
          Here's what's happening with your children today.
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
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
              {school.currentChildren} active children
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${action.color}`}
            >
              <div className="flex items-center">
                <action.icon className="h-8 w-8 mr-3" />
                <div>
                  <h3 className="font-medium">{action.name}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>


      {/* Subscription Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-lg font-medium text-gray-900">
              {school.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Free Plan'}
            </p>
            <p className="text-sm text-gray-500">
              {school.currentChildren} of {school.childrenLimit} children enrolled
            </p>
            {school.subscriptionPlan === 'premium' && school.subscriptionExpiry && (
              <p className="text-sm text-gray-500 mt-1">
                Expires: {new Date(school.subscriptionExpiry).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              school.subscriptionPlan === 'premium' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {school.subscriptionPlan === 'premium' ? 'Premium' : 'Free'}
            </div>
            {school.subscriptionPlan === 'premium' && (
              <p className="text-xs text-gray-500 mt-1">All features available</p>
            )}
            {school.subscriptionPlan === 'free' && (
              <p className="text-xs text-gray-500 mt-1">Limited features</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
