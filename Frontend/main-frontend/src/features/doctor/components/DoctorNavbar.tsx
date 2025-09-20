import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import {
    BookOpen,
    ChevronDown,
    Crown,
    HelpCircle,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Stethoscope,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DoctorNavbar: React.FC = () => {
  const { doctor, logout } = useDoctorAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: Home },
    { name: 'My Patients', href: '/doctor/children', icon: Users },
    { name: 'Task Management', href: '/doctor/tasks', icon: BookOpen },
    { name: 'Chat', href: '/doctor/chat', icon: MessageSquare },
    { name: 'Support Tickets', href: '/doctor/tickets', icon: HelpCircle },
  ];

  const isSubscriptionActive = () => {
    if (!doctor?.subscriptionExpiry) return false;
    return new Date(doctor.subscriptionExpiry) > new Date();
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/doctor/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link
              to="/doctor/dashboard"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Stethoscope className="h-8 w-8 text-red-500 mr-3" />
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
                        ? 'bg-red-500 text-white'
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

          {/* Right side - Doctor Info and Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Subscription Button */}
            <Link
              to="/doctor/subscription"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isSubscriptionActive()
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              <Crown className="mr-2 h-4 w-4" />
              {isSubscriptionActive() ? 'Premium' : 'Upgrade'}
            </Link>

            {/* Doctor Info Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{doctor?.name}</p>
                  <p className="text-xs text-gray-600">Doctor</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{doctor?.name}</p>
                    <p className="text-xs text-gray-500">{doctor?.email}</p>
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
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center"
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
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            {/* Mobile Subscription Button */}
            <Link
              to="/doctor/subscription"
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
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
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

export default DoctorNavbar;
