import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, ChartLine, CheckSquare, Clock, Eye, Gamepad2, Hand, Loader2, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SchoolInfo {
  id: number;
  schoolName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  studentCount: number;
  emailVerified: boolean;
  isVerified: boolean;
  subscriptionStatus: string;
  childrenLimit: number;
  currentChildren: number;
  assignedAdminId: number | null;
}

interface VerificationStatus {
  status: string;
  message: string;
  school: SchoolInfo;
}

const SchoolPendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // Get school email from localStorage or URL params
    const schoolEmail = localStorage.getItem('schoolEmail') || 'newschool@example.com';
    checkVerificationStatus(schoolEmail);
  }, []);

  const checkVerificationStatus = async (email: string) => {
    try {
      setCheckingStatus(true);
      const response = await fetch(`http://localhost:8091/api/school/auth/verification-status?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setVerificationStatus(result);
        
        // If approved, redirect to dashboard
        if (result.status === 'approved') {
          navigate('/school/dashboard');
        }
      } else {
        console.error('Failed to check verification status');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setLoading(false);
      setCheckingStatus(false);
    }
  };

  const handleCheckStatus = () => {
    const schoolEmail = localStorage.getItem('schoolEmail') || 'newschool@example.com';
    checkVerificationStatus(schoolEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('schoolToken');
    localStorage.removeItem('schoolEmail');
    navigate('/school/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  NeuroNurture
                </h1>
                <p className="text-sm text-gray-600 font-medium">Educational Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">Welcome back</p>
                <p className="text-xs text-gray-500">School Administrator</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Status Section */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200/50 mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
          <div className="relative px-8 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg mb-8">
                <Clock className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {verificationStatus?.status === 'pending_email' ? 'Verify Your Email' : 'Account Under Review'}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {verificationStatus?.message}
              </p>
              
              <div className="inline-flex items-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg mb-8">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-3"></div>
                <span className="font-medium">
                  {verificationStatus?.status === 'pending_email' 
                    ? 'Check your email for verification instructions'
                    : 'Our team is reviewing your application'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleCheckStatus} 
                  disabled={checkingStatus}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {checkingStatus ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Check Status
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Student Management Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Student Management</h3>
                  <p className="text-sm text-gray-600">Comprehensive student profiles</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Enroll and manage student profiles with advanced tracking capabilities, progress monitoring, and detailed analytics.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 border-0">
                  Up to {verificationStatus?.school?.childrenLimit || 10} students
                </Badge>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Analytics Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <ChartLine className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
                  <p className="text-sm text-gray-600">Real-time insights</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Get real-time insights into student performance, development progress, and learning outcomes with interactive dashboards.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-800 border-0">
                  Live Data
                </Badge>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Competitions Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Competitions</h3>
                  <p className="text-sm text-gray-600">Engage students</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Organize tournaments and competitions to boost student engagement and create a fun learning environment.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-100 text-yellow-800 border-0">
                  Tournament Tools
                </Badge>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Task Management Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <CheckSquare className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Task Management</h3>
                  <p className="text-sm text-gray-600">Personalized learning</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Assign personalized learning tasks based on individual student needs and track completion progress.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-800 border-0">
                  Personalized
                </Badge>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Games Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Interactive Learning Games</h2>
              <p className="text-indigo-100 max-w-2xl mx-auto">
                Engage students with our suite of cognitive development games designed to enhance learning outcomes.
              </p>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="group text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-100 transition-all duration-300 cursor-pointer">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Dance Doodle</h4>
                <p className="text-sm text-gray-600">Motor Skills Development</p>
              </div>
              <div className="group text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-100 transition-all duration-300 cursor-pointer">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Repeat With Me</h4>
                <p className="text-sm text-gray-600">Memory Training</p>
              </div>
              <div className="group text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-100 transition-all duration-300 cursor-pointer">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Gaze Tracking</h4>
                <p className="text-sm text-gray-600">Attention Focus</p>
              </div>
              <div className="group text-center p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-100 transition-all duration-300 cursor-pointer">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Hand className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mirror Posture</h4>
                <p className="text-sm text-gray-600">Body Awareness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription CTA */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Scale Your Impact?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Your current plan includes up to {verificationStatus?.school?.childrenLimit || 10} students. 
              Upgrade to unlock unlimited potential and advanced features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                disabled 
                className="px-8 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Upgrade Plan (Available after approval)
              </Button>
              <Button 
                variant="ghost" 
                disabled 
                className="px-8 py-3 text-white hover:bg-white/10"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolPendingApproval;
