import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const DoctorEmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`http://localhost:8093/api/doctor/auth/verify-email?token=${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.text();
        setStatus('success');
        setMessage(result);
        // Redirect to pending approval page after 3 seconds
        setTimeout(() => {
          navigate('/doctor/pending-approval');
        }, 3000);
      } else {
        const error = await response.text();
        setStatus('error');
        setMessage(error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/auth/doctor/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md mx-4">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center">
            {status === 'verifying' && (
              <>
                <div className="mb-6">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Verifying Your Email</h3>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-green-600">Email Verified Successfully!</h3>
                <Alert className="mb-6">
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-gray-600 mb-6">
                  Your email has been verified. Your doctor account is now pending admin approval. 
                  You will be redirected to the approval page shortly.
                </p>
                <Button onClick={handleGoToLogin} className="w-full">
                  Go to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-red-600">Verification Failed</h3>
                <Alert className="mb-6">
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-gray-600 mb-6">
                  The verification link may be invalid or expired. Please try registering again.
                </p>
                <Button onClick={() => navigate('/auth/doctor/register')} className="w-full">
                  Register Again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorEmailVerification;

