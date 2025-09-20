import { useToast } from '@/components/ui/use-toast';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkEmailVerificationStatus();
  }, []);

  const checkEmailVerificationStatus = async () => {
    try {
      const res = await fetch('http://localhost:8080/auth/check-email-verified', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const verified = await res.json();
        setIsEmailVerified(verified);
      } else {
        // If not authenticated, redirect to login
        navigate('/');
        return;
      }
    } catch (err) {
      console.error('Error checking email verification status:', err);
      // If there's an error, assume not verified and redirect to login
      navigate('/');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="font-comic text-muted-foreground">Checking verification status...</p>
        </div>
      </div>
    );
  }

  if (isEmailVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-md w-full mx-4">
          <div className="card-playful border-4 border-primary bg-white p-8 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-playful text-primary mb-4">Email Verification Required</h2>
            <p className="text-muted-foreground font-comic mb-6">
              Please verify your email address before accessing this page. Check your inbox for a verification link.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="btn-fun w-full font-comic"
              >
                Go to Sign In
              </button>
              
              <button
                onClick={() => navigate('/verify-email')}
                className="btn-fun w-full font-comic bg-secondary hover:bg-secondary/80"
              >
                Verify Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 