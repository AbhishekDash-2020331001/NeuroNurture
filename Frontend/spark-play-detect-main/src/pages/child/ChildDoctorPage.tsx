import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { childDoctorService, DoctorEnrollmentStatus, DoctorInfo } from '@/services/childDoctorService';
import { getCurrentChild } from '@/utils/childUtils';
import { Award, Calendar, Heart, Mail, MapPin, Phone, Stethoscope, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import ChildDoctorChatPage from './ChildDoctorChatPage';
import ChildDoctorTaskPage from './ChildDoctorTaskPage';

export default function ChildDoctorPage() {
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [doctorStatus, setDoctorStatus] = useState<DoctorEnrollmentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDoctorTab, setActiveDoctorTab] = useState<'overview' | 'tasks' | 'chat'>('overview');
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [isLoadingDoctorInfo, setIsLoadingDoctorInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const childData = getCurrentChild();
    if (childData) {
      setSelectedChild(childData);
      loadDoctorData(childData.id);
    }
  }, []);

  const loadDoctorData = async (childId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading doctor data for child ID:', childId);
      const result = await childDoctorService.getChildDoctorInfo(childId);
      
      console.log('Doctor data loaded:', result);
      setDoctorStatus(result.status);
      setDoctorInfo(result.doctorInfo);
      
    } catch (error) {
      console.error('Error loading doctor data:', error);
      setError('Failed to load doctor information. Please try again.');
      
      // Set fallback data when API fails
      setDoctorStatus({
        childId: childId,
        childName: selectedChild?.name || 'Child',
        doctorId: null,
        problem: null,
        enrolled: false
      });
      setDoctorInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar Navigation - Only show if connected */}
      {doctorStatus?.enrolled && (
        <div className="w-72 border-r border-gray-200 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 h-screen overflow-y-auto shadow-lg">
          {/* Navigation Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-2xl">👩‍⚕️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Doctor Portal</h3>
                <p className="text-blue-100 text-sm">{selectedChild?.name || 'Patient'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4 space-y-2">
            <Button
              variant={activeDoctorTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveDoctorTab('overview')}
              className={`w-full justify-start font-semibold h-12 transition-all duration-200 ${
                activeDoctorTab === 'overview' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700' 
                  : 'text-gray-700 hover:bg-white/50 hover:text-blue-700 hover:shadow-sm'
              }`}
            >
              <span className="text-xl mr-3">📊</span>
              Overview
            </Button>
            
            <Button
              variant={activeDoctorTab === 'tasks' ? 'default' : 'ghost'}
              onClick={() => setActiveDoctorTab('tasks')}
              className={`w-full justify-start font-semibold h-12 transition-all duration-200 ${
                activeDoctorTab === 'tasks' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700' 
                  : 'text-gray-700 hover:bg-white/50 hover:text-blue-700 hover:shadow-sm'
              }`}
            >
              <span className="text-xl mr-3">📝</span>
              Health Tasks
            </Button>
            
            <Button
              variant={activeDoctorTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveDoctorTab('chat')}
              className={`w-full justify-start font-semibold h-12 transition-all duration-200 ${
                activeDoctorTab === 'chat' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700' 
                  : 'text-gray-700 hover:bg-white/50 hover:text-blue-700 hover:shadow-sm'
              }`}
            >
              <span className="text-xl mr-3">💬</span>
              Chat with Doctor
            </Button>
          </div>

          {/* Decorative Elements */}
          <div className="p-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✨</span>
                <p className="text-xs text-blue-700 font-medium">Stay healthy and strong!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 px-1 pb-2 overflow-y-auto">
        {/* Header - Only show if not connected or on overview tab */}
        {(!doctorStatus?.enrolled || activeDoctorTab === 'overview') && (
          <div className="text-center">
            <h2 className="text-3xl font-playful text-primary mb-2 flex items-center justify-center">
              <span className="mr-2">👩‍⚕️</span>
              Doctor Connection
            </h2>
            <p className="text-lg font-comic text-muted-foreground">
              {selectedChild ? `${selectedChild.name}'s doctor connection status` : 'Check doctor connection status'}
            </p>
          </div>
        )}

        {/* Overview Tab Content - Doctor Information */}
        {doctorStatus?.enrolled && activeDoctorTab === 'overview' && doctorInfo && (
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Main Doctor Card */}
            <div className="flex justify-center">
              <Card className="bg-white border border-gray-200 shadow-lg max-w-4xl w-full">
                <CardContent className="p-8">
                  {/* Doctor Header */}
                  <div className="text-center mb-8 border-b border-gray-100 pb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <Stethoscope className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {doctorInfo.firstName} {doctorInfo.lastName}
                    </h2>
                    <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                      <MapPin className="h-5 w-5" />
                      <span className="text-lg">{doctorInfo.hospital}</span>
                    </div>
                  </div>
                  
                  {/* Doctor Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Specialization Card */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <Award className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Specialization</h3>
                      </div>
                      <div className="text-center">
                        <span className="px-4 py-2 text-lg font-medium rounded-lg bg-blue-600 text-white">
                          {doctorInfo.specialization}
                        </span>
                        <p className="text-sm text-gray-600 mt-3">
                          {doctorInfo.yearsOfExperience} years of experience
                        </p>
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                          <Phone className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700">{doctorInfo.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700">{doctorInfo.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700 text-sm">{doctorInfo.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Condition Card */}
                  {doctorStatus.problem && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-red-100 p-3 rounded-full mr-4">
                          <Heart className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Medical Condition</h3>
                      </div>
                      <div className="text-center">
                        <span className="px-4 py-2 text-lg font-medium rounded-lg bg-red-600 text-white">
                          {doctorStatus.problem}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* License Information */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-100 p-3 rounded-full mr-4">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">License Information</h3>
                    </div>
                    <div className="text-center">
                      <span className="px-4 py-2 text-lg font-medium rounded-lg bg-gray-600 text-white">
                        License: {doctorInfo.licenseNumber}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors duration-200">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Appointment
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors duration-200">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Doctor
                </Button>
                <Button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors duration-200">
                  <Heart className="h-5 w-5 mr-2" />
                  View Health Records
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {doctorStatus?.enrolled && activeDoctorTab === 'tasks' ? (
          <ChildDoctorTaskPage 
            childId={selectedChild?.id?.toString() || ''} 
            childName={selectedChild?.name || ''} 
          />
        ) : doctorStatus?.enrolled && activeDoctorTab === 'chat' ? (
          <ChildDoctorChatPage 
            childId={selectedChild?.id?.toString() || ''} 
            childName={selectedChild?.name || ''}
            doctorId={doctorStatus.doctorId || 0}
            doctorName={doctorInfo ? `${doctorInfo.firstName} ${doctorInfo.lastName}` : 'Doctor'}
          />
        ) : (
          <>
            {/* Doctor Connection Status */}
            {isLoading ? (
              <Card className="card-playful border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 backdrop-blur-sm bg-white/80">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse">👩‍⚕️</div>
                  <CardTitle className="text-xl font-playful text-primary mb-2">
                    Loading Doctor Information...
                  </CardTitle>
                  <CardDescription className="text-base font-comic text-muted-foreground">
                    Please wait while we check the connection status
                  </CardDescription>
                </div>
              </Card>
            ) : doctorStatus?.enrolled ? (
              // When connected, show the overview tab content (already handled above)
              null
            ) : (
              <Card className="card-playful border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-8 backdrop-blur-sm bg-white/80">
                <div className="text-center">
                  <div className="text-4xl mb-4">👩‍⚕️</div>
                  <CardTitle className="text-2xl font-playful text-orange-600 mb-3">
                    No Doctor Connected Yet
                  </CardTitle>
                  <CardDescription className="text-lg font-comic text-muted-foreground mb-6">
                    {selectedChild?.name} is not currently connected to a doctor through NeuroNurture.
                  </CardDescription>
                  
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
                    <p className="font-comic text-orange-800 text-base mb-2">
                      <strong>Child ID:</strong> {doctorStatus?.childId || selectedChild?.id}
                    </p>
                    <p className="font-comic text-orange-800 text-sm">
                      Share this ID with your doctor when establishing a connection.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Benefits Section - Only show if not connected */}
            {!doctorStatus?.enrolled && (
              <Card className="card-playful border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 backdrop-blur-sm bg-white/80">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl font-playful text-blue-600 mb-3">
                    Why Connect with a NeuroNurture Doctor? 🌟
                  </CardTitle>
                  <CardDescription className="text-lg font-comic text-muted-foreground">
                    Doctors using NeuroNurture provide enhanced care and monitoring for your child
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="text-4xl bounce-gentle">📊</div>
                    <h4 className="font-playful text-lg text-blue-600">Progress Monitoring</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Real-time tracking of developmental milestones and health metrics
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-4xl float">💬</div>
                    <h4 className="font-playful text-lg text-blue-600">Direct Communication</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Secure messaging and consultation with your child's doctor
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-4xl wiggle">🎯</div>
                    <h4 className="font-playful text-lg text-blue-600">Personalized Care</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Customized treatment plans based on your child's unique needs
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-4xl bounce-gentle">📋</div>
                    <h4 className="font-playful text-lg text-blue-600">Medical Records</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Comprehensive health history and treatment documentation
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-4xl float">🔔</div>
                    <h4 className="font-playful text-lg text-blue-600">Appointment Management</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Easy scheduling and reminders for medical appointments
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="text-4xl wiggle">💊</div>
                    <h4 className="font-playful text-lg text-blue-600">Medication Tracking</h4>
                    <p className="font-comic text-sm text-muted-foreground">
                      Monitor prescriptions and treatment adherence
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-100 border border-blue-300 rounded-lg">
                  <h4 className="font-playful text-lg text-blue-800 mb-3 text-center">
                    How to Get Started 🚀
                  </h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                      <p className="font-comic text-blue-800">
                        <strong>Find a NeuroNurture Doctor:</strong> Look for doctors in your area who use our platform
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                      <p className="font-comic text-blue-800">
                        <strong>Schedule Consultation:</strong> Book an appointment with the doctor
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                      <p className="font-comic text-blue-800">
                        <strong>Provide Child ID:</strong> Give your child's ID ({doctorStatus?.childId || selectedChild?.id}) to the doctor
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                      <p className="font-comic text-blue-800">
                        <strong>Start Monitoring:</strong> Once connected, you'll see the doctor's information here!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Doctor Features Preview - Only show if connected */}
            {doctorStatus?.enrolled && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
                  <div className="text-center space-y-3">
                    <div className="text-3xl bounce-gentle">📈</div>
                    <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                      Health Progress
                    </CardTitle>
                    <CardDescription className="font-comic text-sm">
                      Track developmental milestones and health metrics
                    </CardDescription>
                  </div>
                </Card>

                <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
                  <div className="text-center space-y-3">
                    <div className="text-3xl float">💬</div>
                    <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                      Doctor Communication
                    </CardTitle>
                    <CardDescription className="font-comic text-sm">
                      Secure messaging and consultation with your doctor
                    </CardDescription>
                  </div>
                </Card>

                <Card className="card-playful hover:scale-105 hover:shadow-lg transition-all duration-300 group p-6 backdrop-blur-sm bg-white/80">
                  <div className="text-center space-y-3">
                    <div className="text-3xl wiggle">📋</div>
                    <CardTitle className="font-playful text-lg group-hover:text-primary transition-colors">
                      Medical Records
                    </CardTitle>
                    <CardDescription className="font-comic text-sm">
                      Access comprehensive health history and treatments
                    </CardDescription>
                  </div>
                </Card>
              </div>
            )}

            {/* Coming Soon Features */}
            <Card className="card-playful p-6 backdrop-blur-sm bg-white/80">
              <div className="text-center">
                <h3 className="font-playful text-xl text-primary mb-3">
                  Coming Soon! 🌟
                </h3>
                <p className="font-comic text-lg text-muted-foreground mb-4">
                  We're working on amazing doctor integration features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📱</span>
                    <span className="font-comic">Video Consultations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔔</span>
                    <span className="font-comic">Appointment Reminders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💊</span>
                    <span className="font-comic">Medication Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span className="font-comic">Advanced Analytics</span>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
