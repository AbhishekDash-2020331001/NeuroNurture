import { getDashboardStats } from '@/data/doctorMockData';
import SubscriptionStatus from '@/features/doctor/components/SubscriptionStatus';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import {
    BarChart3,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Crown,
    Download,
    MessageSquare,
    Shield,
    Stethoscope,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const { doctor } = useDoctorAuth();
  const dashboardStats = getDashboardStats();

  // DoctorAuthGuard handles authentication, so we can assume doctor exists here

  // Check if doctor has active premium subscription
  const isPremiumActive = () => {
    if (!doctor?.subscriptionExpiry) return false;
    return new Date(doctor.subscriptionExpiry) > new Date();
  };

  // Premium features list
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

  const stats = [
    {
      name: 'My Patients',
      value: dashboardStats.activePatients,
      icon: Users,
      color: 'bg-red-500',
      href: '/doctor/children',
      subtitle: `of ${doctor?.maxChildren || 3} max`
    },
    {
      name: 'Active Tasks',
      value: dashboardStats.activeTasks,
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/doctor/tasks',
      subtitle: 'currently assigned'
    },
    {
      name: 'Completed Tasks',
      value: dashboardStats.completedTasks,
      icon: CheckCircle,
      color: 'bg-yellow-500',
      href: '/doctor/tasks/history',
      subtitle: 'this month'
    },
    {
      name: 'Avg. Progress',
      value: `${dashboardStats.averageProgress}%`,
      icon: TrendingUp,
      color: 'bg-black',
      href: '/doctor/children',
      subtitle: 'across all patients'
    }
  ];

  const quickActions = [
    {
      name: 'Assign Task',
      description: 'Create therapeutic exercises',
      icon: BookOpen,
      href: '/doctor/tasks',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      name: 'View Progress',
      description: 'Monitor patient development',
      icon: BarChart3,
      href: '/doctor/children',
      color: 'bg-red-100 text-red-700 hover:bg-red-200'
    },
    {
      name: 'Chat with Patient',
      description: 'Direct communication',
      icon: MessageSquare,
      href: '/doctor/chat',
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    },
    {
      name: 'Task History',
      description: 'Review completed activities',
      icon: Clock,
      href: '/doctor/tasks/history',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    }
  ];


  return (
    <div className="py-2">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-400 rounded-2xl p-3 sm:p-4 text-white shadow-xl mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white drop-shadow-sm">
                Welcome back, Dr. {doctor?.name?.split(' ')[1] || 'Doctor'}!
              </h1>
              <p className="text-white/90 text-lg mb-4 drop-shadow-sm">
                Here's your therapeutic practice overview for today
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/90 drop-shadow-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  <span>{doctor?.specialization || 'Pediatric Therapist'}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                to="/doctor/tasks"
                className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Assign Task
              </Link>
              <Link
                to="/doctor/chat"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-all duration-200 shadow-sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mb-4">
          <SubscriptionStatus />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-purple-200 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 ${action.color} transition-all duration-200 hover:scale-105 hover:shadow-md`}
                >
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="font-medium text-sm mb-1">{action.name}</h3>
                  <p className="text-xs text-center opacity-80">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>


        {/* Premium Features and Upgrade Card - Only show for free users */}
        {!isPremiumActive() && (
          <>
            {/* Premium Features Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock Premium Features</h3>
                <p className="text-gray-600">Upgrade to access these powerful tools and unlimited patients</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className={`${feature.bgColor} rounded-lg p-4`}>
                    <div className="flex items-start">
                      <feature.icon className={`h-6 w-6 ${feature.color} mr-3 mt-1`} />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Call to Action */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-3 sm:p-4 text-white shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold mb-2">Ready to unlock unlimited potential?</h2>
                  <p className="text-purple-100 text-lg mb-4">
                    Upgrade to premium and access all features with unlimited patients
                  </p>
                  <p className="text-sm text-purple-200">
                    Basic Plan • {3 - dashboardStats.activePatients} patient slots available
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <Link
                    to="/doctor/pricing"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    View Premium Plans
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Crown className="h-12 w-12 text-purple-300" />
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

export default DoctorDashboard;