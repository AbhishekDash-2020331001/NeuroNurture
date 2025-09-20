import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import {
    BarChart3,
    BookOpen,
    ChevronDown,
    Crown,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    School,
    Trophy,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SchoolNavbar: React.FC = () => {
  const { school, logout } = useSchoolAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if school has active subscription (same logic as dashboard)
  const isSubscriptionActive = () => {
    if (!school?.subscriptionExpiry) return false;
    return new Date(school.subscriptionExpiry) > new Date();
  };

  const navigation = [
    { name: 'Dashboard', href: '/school/dashboard', icon: Home },
    { name: 'Children', href: '/school/children', icon: Users },
    { name: 'Tasks', href: '/school/tasks', icon: BookOpen },
    { name: 'Tournaments', href: '/school/tournaments', icon: Trophy },
    { name: 'Progress Comparison', href: '/school/progress-comparison', icon: BarChart3 },
  ];

  // Premium features for schools
  const premiumFeatures = [
    {
      icon: Users,
      title: 'Unlimited Children',
      description: 'Enroll unlimited students without any restrictions',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get detailed insights and reports on student progress',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: MessageSquare,
      title: 'Priority Support',
      description: 'Get priority support and faster response times',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: BookOpen,
      title: 'Custom Tasks',
      description: 'Create personalized learning activities and tasks',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Trophy,
      title: 'Tournament Management',
      description: 'Organize and manage educational tournaments',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/school/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link
              to="/school/dashboard"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <School className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">NeuroNurture</span>
            </Link>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - School Info and Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Premium Subscription Button */}
            <Link
              to={isSubscriptionActive() ? "/school/subscription" : "/school/pricing"}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isSubscriptionActive()
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              <Crown className="mr-2 h-4 w-4" />
              {isSubscriptionActive() ? 'Premium' : 'Upgrade'}
            </Link>

            {/* School Info Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{school.name}</p>
                  {/* <p className="text-xs text-gray-500">
                    {school.currentChildren} / {school.childrenLimit} children
                  </p> */}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{school.name}</p>
                    <p className="text-xs text-gray-500">{school.email}</p>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        isSubscriptionActive() 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {isSubscriptionActive() ? 'Premium' : 'Free'} Plan
                      </span>
                    </div>
                  </div>

                  {/* Support Tickets */}
                  <Link
                    to="/school/tickets"
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Support Tickets
                  </Link>

                  {/* Premium Features Section */}
                  {isSubscriptionActive() && (
                    <>
                      <div className="px-4 py-2 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Premium Features
                        </p>
                        <div className="space-y-1">
                          {premiumFeatures.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <feature.icon className="mr-2 h-3 w-3 text-green-500" />
                              {feature.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center border-t border-gray-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Premium Button */}
            <Link
              to={isSubscriptionActive() ? "/school/subscription" : "/school/pricing"}
              className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                isSubscriptionActive()
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Crown className="mr-3 h-5 w-5" />
              {isSubscriptionActive() ? 'Premium Active' : 'Subscription'}
            </Link>

            {/* Mobile Support Tickets */}
            <Link
              to="/school/tickets"
              className="flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Support Tickets
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SchoolNavbar;
