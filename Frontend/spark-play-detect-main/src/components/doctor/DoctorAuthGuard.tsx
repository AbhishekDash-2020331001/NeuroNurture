import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDoctorAuth } from '@/contexts/doctor/DoctorAuthContext';

interface DoctorAuthGuardProps {
  children: React.ReactNode;
}

const DoctorAuthGuard: React.FC<DoctorAuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useDoctorAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to doctor login with return url
    return <Navigate to="/auth/doctor/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default DoctorAuthGuard;
