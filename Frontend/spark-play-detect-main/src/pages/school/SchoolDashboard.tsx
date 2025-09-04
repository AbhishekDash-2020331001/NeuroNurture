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

  const recentActivity = [
    {
      type: 'Task Completed',
      description: 'Sarah Johnson completed Math Quiz',
      time: '2 hours ago',
      icon: BookOpen,
      color: 'text-green-600'
    },
    {
      type: 'Tournament Started',
      description: 'Spring Games Tournament began',
      time: '1 day ago',
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      type: 'New Child',
      description: 'Mike Chen enrolled in Grade 3',
      time: '2 days ago',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      type: 'Performance Update',
      description: 'Class 2A improved by 15%',
      time: '3 days ago',
      icon: TrendingUp,
      color: 'text-purple-600'
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
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
              {school.subscriptionStatus === 'active' ? 'Premium Plan' : 'Basic Plan'}
            </p>
            <p className="text-sm text-gray-500">
              {school.currentChildren} of {school.childrenLimit} children enrolled
            </p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              school.subscriptionStatus === 'active' 
                ? 'bg-green-100 text-green-800'
                : school.subscriptionStatus === 'expired'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {school.subscriptionStatus.charAt(0).toUpperCase() + school.subscriptionStatus.slice(1)}
            </div>
            {school.subscriptionStatus === 'active' && (
              <p className="text-xs text-gray-500 mt-1">All features available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
