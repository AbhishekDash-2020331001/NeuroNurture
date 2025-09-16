import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, Users, GraduationCap, Stethoscope } from 'lucide-react';

const LandingNavbar: React.FC = () => {
  const location = useLocation();
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Helper function to get active styles
  const getActiveStyles = (path: string, defaultColor: string) => {
    if (isActive(path)) {
      return `flex items-center space-x-2 ${defaultColor} font-semibold bg-gray-100 px-3 py-2 rounded-lg transition-colors`;
    }
    return `flex items-center space-x-2 text-gray-600 hover:${defaultColor} transition-colors`;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity ml-4">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NeuroNurture</span>
          </Link>

          {/* Navigation Links - Absolutely Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link 
              to="/" 
              className={getActiveStyles('/', 'text-blue-600')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/auth/parent/login" 
                className={getActiveStyles('/auth/parent/login', 'text-blue-600')}
              >
                <Users className="h-4 w-4" />
                <span>Parent</span>
              </Link>
              
              <Link 
                to="/auth/school/login" 
                className={getActiveStyles('/auth/school/login', 'text-green-600')}
              >
                <GraduationCap className="h-4 w-4" />
                <span>School</span>
              </Link>
              
              <Link 
                to="/auth/doctor/login" 
                className={getActiveStyles('/auth/doctor/login', 'text-purple-600')}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Doctor</span>
              </Link>
            </div>
          </div>

          {/* Spacer to push mobile menu button to the right */}
          <div className="flex-1"></div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={getActiveStyles('/', 'text-blue-600')}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <div className="flex flex-col space-y-3 pl-6">
              <Link 
                to="/auth/parent/login" 
                className={getActiveStyles('/auth/parent/login', 'text-blue-600')}
              >
                <Users className="h-4 w-4" />
                <span>Parent Login</span>
              </Link>
              
              <Link 
                to="/auth/school/login" 
                className={getActiveStyles('/auth/school/login', 'text-green-600')}
              >
                <GraduationCap className="h-4 w-4" />
                <span>School Login</span>
              </Link>
              
              <Link 
                to="/auth/doctor/login" 
                className={getActiveStyles('/auth/doctor/login', 'text-purple-600')}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Doctor Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
