import LandingNavbar from '@/components/common/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Brain, Building2, Eye, EyeOff, GraduationCap } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SchoolLoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8091/api/school/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('School login response:', data);
        console.log('JWT Token received:', data.token);
        console.log('Backend subscriptionStatus:', data.school.subscriptionStatus);
        console.log('Backend subscriptionPlan:', data.school.subscriptionPlan);
        console.log('Backend subscriptionExpiry:', data.school.subscriptionExpiry);
        
        // Store token and school data
        localStorage.setItem('schoolToken', data.token);
        localStorage.setItem('schoolEmail', formData.email);
        
        const schoolData = {
          id: data.school.id.toString(),
          name: data.school.schoolName,
          email: data.school.email,
          address: `${data.school.address}, ${data.school.city}, ${data.school.state} ${data.school.zipCode}`,
          phone: data.school.phone,
          subscriptionStatus: data.school.subscriptionStatus,
          subscriptionPlan: data.school.subscriptionPlan || 'free',
          subscriptionExpiry: data.school.subscriptionExpiry,
          childrenLimit: data.school.childrenLimit,
          currentChildren: data.school.currentChildren
        };
        
        console.log('Parsed school data:', schoolData);
        console.log('Parsed subscriptionExpiry:', schoolData.subscriptionExpiry);
        console.log('Parsed subscriptionPlan:', schoolData.subscriptionPlan);
        
        localStorage.setItem('schoolAuth', JSON.stringify(schoolData));
        navigate('/school/dashboard');
      } else {
        const errorText = await response.text();
        if (errorText.includes('email verification')) {
          setError('Please verify your email before logging in. Check your email for verification instructions.');
        } else if (errorText.includes('admin approval')) {
          setError('Your school account is pending admin approval. You will be notified once approved.');
          // Store email for status checking
          localStorage.setItem('schoolEmail', formData.email);
          navigate('/school/pending-approval');
        } else {
          setError('Invalid email or password.');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Navbar */}
      <LandingNavbar />
      
      <div className="flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="relative">
                  <Brain className="w-16 h-16 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">School Features</h1>
              <p className="text-lg text-gray-600">Comprehensive tools for educational institutions</p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Track child's progress</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Arrange competition</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Assign task and track</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Compare among children</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 text-base">Dedicated AI Agent for getting insights of enrolled child</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">School Access</CardTitle>
                         <CardDescription className="text-gray-600">
               Sign in to manage child development and organize competitions
             </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  School Email
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 pl-10"
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
                    className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 pr-12"
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
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/auth/school/forgot-password"
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Access School Portal'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to NeuroNurture?{' '}
                <Link
                  to="/auth/school/register"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Register your school
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

export default SchoolLoginForm;
