import LandingNavbar from '@/components/common/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDoctorAuth } from '@/features/doctor/contexts/DoctorAuthContext';
import { ArrowLeft, Brain, Eye, EyeOff, Stethoscope, User } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DoctorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useDoctorAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    clearError();
    
    const success = await login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });
    
    if (success) {
      navigate('/doctor/dashboard');
    } else {
      setLoginError('Login failed. Please check your credentials.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const displayError = error?.message || loginError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      {/* Navbar */}
      <LandingNavbar />
      
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="relative">
                  <Brain className="w-16 h-16 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Features</h1>
              <p className="text-lg text-gray-600">Comprehensive tools for medical professionals</p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Track patient's progress</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Assign task and track</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Chat with patient</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Dedicated AI Agent for getting insights of patient</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Medical Access</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to monitor patient development and manage therapeutic interventions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {displayError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{displayError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Professional Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/auth/doctor/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Access Medical Portal'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to NeuroNurture?{' '}
                <Link
                  to="/auth/doctor/register"
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Register as Doctor
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to role selection
          </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
