import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Brain, Check, Eye, EyeOff, Stethoscope } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DoctorRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    hospital: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8093/api/doctor/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.email, // Use email as username
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
          hospital: formData.hospital,
          address: '', // Add address fields to form if needed
          city: '',
          state: '',
          zipCode: '',
          yearsOfExperience: 0 // Add experience field to form if needed
        }),
      });

      if (response.ok) {
        const result = await response.text();
        alert(result);
        // Store email for verification status checking
        localStorage.setItem('doctorEmail', formData.email);
        // Redirect to pending approval page after 5 seconds to show success message
        setTimeout(() => {
          navigate('/doctor/pending-approval');
        }, 5000);
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (err) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
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

  const specializations = [
    'Pediatric Neurology',
    'Child Psychology',
    'Developmental Pediatrics',
    'Speech Therapy',
    'Occupational Therapy',
    'Physical Therapy',
    'Behavioral Therapy',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-purple-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NeuroNurture</h1>
          <p className="text-gray-600">Medical Portal Registration</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Medical Professional Registration</CardTitle>
            <CardDescription className="text-gray-600">
              Join NeuroNurture to provide comprehensive care for your patients
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Professional Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">
                    License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    placeholder="Medical license number"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-sm font-medium text-gray-700">
                    Specialization
                  </Label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="h-11 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital" className="text-sm font-medium text-gray-700">
                    Hospital/Clinic
                  </Label>
                  <Input
                    id="hospital"
                    name="hospital"
                    type="text"
                    placeholder="Hospital or clinic name"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
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
                  Confirm Password
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
                    className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
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

              <div className="flex items-start space-x-2">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-purple-600 hover:text-purple-800 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-800 font-medium">
                    Privacy Policy
                  </Link>
                  . I confirm that I am a licensed medical professional.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Register as Medical Professional'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/doctor/login"
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Verification Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Verification Required</h4>
              <p className="text-xs text-blue-700">
                Your account will be reviewed and verified within 24-48 hours. You'll receive an email confirmation once approved.
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

export default DoctorRegister;
