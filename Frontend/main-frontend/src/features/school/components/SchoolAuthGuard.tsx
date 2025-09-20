import { useSchoolAuth } from '@/features/school/contexts/SchoolAuthContext';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SchoolAuthGuardProps {
  children: React.ReactNode;
}

const SchoolAuthGuard: React.FC<SchoolAuthGuardProps> = ({ children }) => {
  const { school, isAuthenticated, isLoading } = useSchoolAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to school login if not authenticated
      navigate('/auth/school/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default SchoolAuthGuard;
