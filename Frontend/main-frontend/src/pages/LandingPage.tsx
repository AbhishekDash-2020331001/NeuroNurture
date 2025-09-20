import LandingNavbar from '@/components/common/LandingNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ArrowRight,
    Award,
    BarChart3,
    Brain,
    Clock,
    GraduationCap,
    Heart,
    MessageSquare,
    Shield,
    Star,
    Stethoscope,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRoleSelection = (role: string) => {
    navigate(`/auth/${role}/login`);
  };

  const roleCards = [
    {
      id: 'parent',
      title: 'Parent',
      description: 'Track your child\'s development journey and support their growth through engaging games',
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Detect child\'s autism through gameplay',
        'Growth of cognitive skills',
        'Track child\'s growth',
        'Get AI insights',
        'Connect with schools and doctors',
        'Dedicated AI Agent for getting insights for all child',
        'Advance comparison between child'
      ],
      image: '/images/parent-illustration.svg'
    },
    {
      id: 'school',
      title: 'School',
      description: 'Manage student development, organize competitions, and track educational progress',
      icon: GraduationCap,
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Track child\'s progress',
        'Arrange competition',
        'Assign task and track',
        'Compare among children',
        'Dedicated AI Agent for getting insights of enrolled child'
      ],
      image: '/images/school-illustration.svg'
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Monitor patient development, assign therapeutic tasks, and maintain detailed records',
      icon: Stethoscope,
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Track patient\'s progress',
        'Assign task and track',
        'Chat with patient',
        'Dedicated AI Agent for getting insights of patient'
      ],
      image: '/images/doctor-illustration.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navbar */}
      <LandingNavbar />
      
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Brain className="w-20 h-20 text-blue-600 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                NeuroNurture
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Empowering child development through innovative technology and collaborative care
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span>Evidence-Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Child-Centered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Professional Grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your role to access the appropriate dashboard and features tailored to your needs
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {roleCards.map((role, index) => (
            <Card 
              key={role.id}
              className={`${role.bgColor} ${role.borderColor} border-2 hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:scale-105 h-full flex flex-col ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => handleRoleSelection(role.id)}
            >
              <CardContent className="p-8 flex flex-col h-full">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <role.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {role.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                {/* Features Section - Left Aligned */}
                <div className="flex-1 mb-6">
                  <div className="space-y-2 text-left">
                    {role.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex}
                        className="text-sm text-gray-500 flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Button Section - Always at bottom */}
                <div className="mt-auto">
                  <Button 
                    className={`w-full bg-gradient-to-r ${role.color} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                    size="lg"
                  >
                    Continue as {role.title}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose NeuroNurture?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform designed to support every aspect of child development
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">Advanced analytics and machine learning to provide meaningful insights into child development patterns.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborative Care</h3>
              <p className="text-gray-600">Seamless communication between parents, educators, and healthcare professionals for holistic support.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence-Based</h3>
              <p className="text-gray-600">Built on scientific research and validated methodologies for reliable developmental assessment.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">Enterprise-grade security with end-to-end encryption to protect sensitive child development data.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Monitoring</h3>
              <p className="text-gray-600">Track progress and development milestones in real-time with instant updates.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Analytics</h3>
              <p className="text-gray-600">Detailed reports and visualizations to track progress, identify patterns, and measure improvement.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Integrated Communication</h3>
              <p className="text-gray-600">Built-in messaging for doctors and parents.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Responsive</h3>
              <p className="text-gray-600">Lightning-fast performance with optimized gameplay .</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600">Trusted by autism schools with measurable improvements in child development.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals and families already using NeuroNurture
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => handleRoleSelection('parent')}
            >
              Start as Parent
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
              onClick={() => handleRoleSelection('school')}
            >
              Join as School
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
              onClick={() => handleRoleSelection('doctor')}
            >
              Join as Doctor
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-400">
              © 2025 NeuroNurture. Empowering child development through technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
