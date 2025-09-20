import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthSuccessHandler } from '@/features/auth/components/AuthSuccessHandler';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { SignUpForm } from '@/features/auth/components/SignUpForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showAuthHandler, setShowAuthHandler] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Auth page: Checking session...');
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => {
        console.log('Auth page: Session response status:', res.status);
        return res.json();
      })
      .then(authenticated => {
        console.log('Auth page: Session result:', authenticated);
        if (authenticated) {
          console.log('Auth page: User is authenticated, showing AuthSuccessHandler');
          setShowAuthHandler(true);
        } else {
          console.log('Auth page: User is not authenticated, showing login form');
        }
        setIsCheckingAuth(false);
      })
      .catch(error => {
        console.error('Auth page: Session check error:', error);
        setIsCheckingAuth(false);
      });
  }, [navigate]);

  const handleAuthSuccess = () => {
    // Show the auth handler to determine where to redirect
    setShowAuthHandler(true);
  };

  if (showAuthHandler) {
    return <AuthSuccessHandler onComplete={() => setShowAuthHandler(false)} />;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-2xl font-comic">Setting up your account... 🌟</div>
      </div>
    );
  }

  return (
    <AuthLayout
      title={isSignIn ? "Welcome Back!" : "Join NeuroNurture!"}
      subtitle={
        isSignIn 
          ? "Sign in to continue your learning adventure!" 
          : "Create an account to start your journey!"
      }
    >
      {isSignIn ? (
        <SignInForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignUp={() => setIsSignIn(false)}
        />
      ) : (
        <SignUpForm
          onSuccess={handleAuthSuccess}
          onSwitchToSignIn={() => setIsSignIn(true)}
        />
      )}
    </AuthLayout>
  );
}