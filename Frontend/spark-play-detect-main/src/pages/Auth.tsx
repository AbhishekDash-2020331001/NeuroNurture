import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthSuccessHandler } from '@/components/auth/AuthSuccessHandler';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showAuthHandler, setShowAuthHandler] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (authenticated) {
          setShowAuthHandler(true);
        }
      });
  }, [navigate]);

  const handleAuthSuccess = () => {
    // Show the auth handler to determine where to redirect
    setShowAuthHandler(true);
  };

  if (showAuthHandler) {
    return <AuthSuccessHandler onComplete={() => setShowAuthHandler(false)} />;
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