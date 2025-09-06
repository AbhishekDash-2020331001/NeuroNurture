import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Brain, Building2, Check, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SchoolRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    studentCount: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8091/api/school/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email, // Use email as username
          email: formData.email,
          password: formData.password,
          schoolName: formData.schoolName,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          studentCount: parseInt(formData.studentCount)
        }),
      });

      if (response.ok) {
        const result = await response.text();
        setSuccess(result);
        // Store email for verification status checking
        localStorage.setItem('schoolEmail', formData.email);
        // Redirect to pending approval page after 5 seconds to show success message
        setTimeout(() => {
          navigate('/school/pending-approval');
        }, 5000);
      } else {
        const errorText = await response.text();
        setError(errorText);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) }
  ];

  const studentCount = parseInt(formData.studentCount) || 0;
  const needsSubscription = studentCount > 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-green-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NeuroNurture</h1>
          <p className="text-gray-600">School Registration</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Register Your School</CardTitle>
            <CardDescription className="text-gray-600">
              Join NeuroNurture to enhance student development tracking
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-green-600" />
                  School Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolName" className="text-sm font-medium text-gray-700">
                    School Name *
                  </Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    placeholder="Enter school name"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                      Contact Person *
                    </Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      placeholder="Full name"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      School Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="school@example.edu"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentCount" className="text-sm font-medium text-gray-700">
                      Expected Student Count *
                    </Label>
                    <Input
                      id="studentCount"
                      name="studentCount"
                      type="number"
                      placeholder="Number of students"
                      value={formData.studentCount}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                      ZIP Code
                    </Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Check 
                            className={`w-3 h-3 mr-2 ${req.met ? 'text-green-500' : 'text-gray-300'}`} 
                          />
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Subscription Notice */}
              {needsSubscription && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800">Subscription Required</h4>
                      <p className="text-xs text-yellow-700">
                        Schools with more than 10 students require a paid subscription. 
                        You'll be contacted after registration for subscription details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-green-600 hover:text-green-800 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-green-600 hover:text-green-800 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Registering school...
                  </div>
                ) : (
                  'Register School'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/school/login"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Sign in
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
  );
};

export default SchoolRegister;