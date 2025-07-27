import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(auth => {
        setAuthenticated(auth);
        setAuthChecked(true);
        if (!auth) {
          navigate('/auth');
        }
      });
  }, [navigate]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}; 