import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(authenticated => {
        if (authenticated) {
          navigate('/dashboard');
        }
      });
  }, [navigate]);

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful authentication
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title={isSignIn ? "Welcome Back!" : "Join KidsPlay!"}
      subtitle={isSignIn ? "Sign in to continue your learning adventure" : "Create your account to start playing"}
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