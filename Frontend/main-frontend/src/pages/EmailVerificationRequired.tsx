import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerificationRequired: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Get email from URL params or state
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Email not found. Please try logging in again.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('http://localhost:8080/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        const errorData = await response.text();
        setResendMessage('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verification Required
            </h1>
            <p className="text-gray-600">
              Please verify your email address before logging in.
            </p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Email address:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-gray-900">What to do next:</h3>
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                Check your email inbox for a verification link
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                Click the verification link in the email
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                Return here and try logging in again
              </li>
            </ol>
          </div>

          {/* Resend Button */}
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>

            {resendMessage && (
              <p className={`text-sm ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>

          {/* Back to Login */}
          <button
            onClick={handleBackToLogin}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired; 