import { AuthSuccessHandler } from '@/components/auth/AuthSuccessHandler';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [showAuthHandler, setShowAuthHandler] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (authenticated) {
          setShowAuthHandler(true);
        } else {
          // If not authenticated, redirect to landing page
          navigate('/');
        }
      });
  }, [navigate]);

  if (showAuthHandler) {
    return <AuthSuccessHandler onComplete={() => setShowAuthHandler(false)} />;
  }

  // This should not be reached since we redirect to landing page if not authenticated
  return (
    <div className="min-h-screen bg-soft flex items-center justify-center">
      <div className="text-2xl font-comic">Redirecting...</div>
    </div>
  );
}