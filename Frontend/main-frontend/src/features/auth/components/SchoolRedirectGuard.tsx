import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SchoolRedirectGuard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if school is logged in
    const schoolToken = localStorage.getItem('schoolToken');
    const schoolAuth = localStorage.getItem('schoolAuth');
    
    if (schoolToken && schoolAuth) {
      console.log('School is already logged in, redirecting to dashboard');
      navigate('/school/dashboard', { replace: true });
    }
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default SchoolRedirectGuard;
